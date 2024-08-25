#!/bin/bash

# Check if pdftk is installed
if ! command -v pdftk &> /dev/null
then
    echo "pdftk is not installed. Please install it first."
    exit 1
fi

# Check if correct number of arguments is provided
if [ "$#" -lt 5 ]; then
    echo "Usage: $0 <input_pdf> <output_prefix> <pages_per_chunk> <max_pages> <lang1> [lang2] [lang3] ..."
    exit 1
fi

INPUT_PDF=$1
OUTPUT_PREFIX=$2
PAGES_PER_CHUNK=$3
MAX_PAGES=$4
shift 4  # Shift the first 4 arguments out

# Collect all languages into a single string
LANGS=""
for lang in "$@"
do
    LANGS+="$lang,"
done
LANGS=${LANGS%,}  # Remove trailing comma

# Get the total number of pages in the PDF
TOTAL_PAGES=$(pdftk "$INPUT_PDF" dump_data | grep NumberOfPages | awk '{print $2}')

# Calculate the number of chunks
NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))

# Limit to MAX_PAGES if specified
if [ $MAX_PAGES -gt 0 ] && [ $MAX_PAGES -lt $TOTAL_PAGES ]; then
    TOTAL_PAGES=$MAX_PAGES
    NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))
fi

echo "Processing $TOTAL_PAGES pages in $NUM_CHUNKS chunks..."

# Split the PDF and process each chunk
for (( i=1; i<=NUM_CHUNKS; i++ ))
do
    START=$(( (i-1)*PAGES_PER_CHUNK + 1 ))
    END=$(( i*PAGES_PER_CHUNK ))
    
    # Ensure we don't exceed the total number of pages
    if [ $END -gt $TOTAL_PAGES ]; then
        END=$TOTAL_PAGES
    fi
    
    CHUNK_NAME="${OUTPUT_PREFIX}_${i}.pdf"
    echo "Creating chunk $i (pages $START to $END)"
    pdftk "$INPUT_PDF" cat $START-$END output "$CHUNK_NAME"
    
    echo "Processing chunk $i"
    marker_single "$CHUNK_NAME" "${OUTPUT_PREFIX}_${i}_output" --batch_multiplier 1 --max_pages $PAGES_PER_CHUNK --langs $LANGS
done

echo "Processing complete."
