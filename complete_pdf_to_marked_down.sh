
# # v4

# #!/bin/bash

# echo "Script started with arguments: $@"
# set -x  # This will print each command before it's executed
# if ! command -v pdftk &> /dev/null
# then
#     echo "pdftk is not installed. Please install it first."
#     exit 1
# fi

# # Check if the correct number of arguments is provided
# if [ "$#" -lt 4 ]; then
#     echo "Usage: $0 <input_pdf> <output_prefix> <pages_per_chunk> <max_pages> <task_id> <lang1> [lang2] [lang3] ..."
#     exit 1
# fi

# INPUT_PDF=$1
# OUTPUT_PREFIX=$2
# PAGES_PER_CHUNK=$3
# MAX_PAGES=$4
# TASK_ID=$5
# shift 5 # Shift the first 5 arguments out

# # Collect all languages into a single string
# LANGS=""
# for lang in "$@"
# do
#     LANGS+="$lang,"
# done

# # Set default language to English if no languages are provided
# if [ -z "$LANGS" ]; then
#     LANGS="english"
# else
#     LANGS=${LANGS%,} # Remove trailing comma
# fi

# # Get the total number of pages in the PDF
# TOTAL_PAGES=$(pdftk "$INPUT_PDF" dump_data | grep NumberOfPages | awk '{print $2}')

# # If MAX_PAGES is less than 0, set it to TOTAL_PAGES
# if [ $MAX_PAGES -lt 0 ]; then
#     MAX_PAGES=$TOTAL_PAGES
# fi

# # Calculate the number of chunks
# NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))

# # Limit to MAX_PAGES if specified
# if [ $MAX_PAGES -gt 0 ] && [ $MAX_PAGES -lt $TOTAL_PAGES ]; then
#     TOTAL_PAGES=$MAX_PAGES
#     NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))
# fi

# echo "Processing $TOTAL_PAGES pages in $NUM_CHUNKS chunks..."

# # Initialize an empty output file for final markdown output
# FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
# > "$FINAL_OUTPUT"

# # Create a directory to store all combined images
# COMBINED_IMAGES_DIR="${OUTPUT_PREFIX}_combined_images"
# mkdir -p "$COMBINED_IMAGES_DIR"

# # Initialize a counter for renaming PNG files
# COUNTER=1

# # Function to update progress
# update_progress() {
#     local progress=$1
#     curl -X POST -H "Content-Type: application/json" -d "{\"taskId\":\"$TASK_ID\",\"progress\":$progress}" http://localhost:3000/update-progress
# }

# # Split the PDF, process each chunk, and merge results
# for (( i=1; i<=NUM_CHUNKS; i++ ))
# do
#     START=$(( (i-1)*PAGES_PER_CHUNK + 1 ))
#     END=$(( i*PAGES_PER_CHUNK ))
    
#     # Ensure we don't exceed the total number of pages
#     if [ $END -gt $TOTAL_PAGES ]; then
#         END=$TOTAL_PAGES
#     fi
    
#     CHUNK_NAME="${OUTPUT_PREFIX}_${i}.pdf"
#     echo "Creating chunk $i (pages $START to $END)"
#     pdftk "$INPUT_PDF" cat $START-$END output "$CHUNK_NAME"
    
#     echo "Processing chunk $i"
#     marker_single "$CHUNK_NAME" "${OUTPUT_PREFIX}_${i}_output" --batch_multiplier 1 --max_pages $PAGES_PER_CHUNK --langs $LANGS
    
#     # Update progress
#     PROGRESS=$(( i * 100 / NUM_CHUNKS ))
#     update_progress $PROGRESS
    
#     # ... (rest of the script remains the same)
#         # Combine markdown and handle images for the current chunk
#     CHUNK_OUTPUT_DIR="${OUTPUT_PREFIX}_${i}_output/output_${i}"
#     CHUNK_OUTPUT="${CHUNK_OUTPUT_DIR}/output_${i}.md"
    
#     if [ -f "$CHUNK_OUTPUT" ]; then
#         # Read the contents of the markdown file into a variable
#         MODIFIED_CONTENT=$(cat "$CHUNK_OUTPUT")
        
#         # Process all PNG files in the current chunk
#         # Loop through all PNG files in the current chunk
#         for IMG in "${CHUNK_OUTPUT_DIR}"/*.png; do
#             if [ -f "$IMG" ]; then
#                 # Generate a new name for the image using the counter
#                 NEW_IMG_NAME="image_${COUNTER}.png"
#                 cp "$IMG" "${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}"
                
#                 # Replace the old image name with the new image name, including the relative path
#                 MODIFIED_CONTENT=$(echo "$MODIFIED_CONTENT" | sed "s|$(basename "$IMG")|./${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}|g")
                
#                 # Increment the counter
#                 COUNTER=$((COUNTER + 1))
#             fi
#         done

        
#         # Append the modified content to the final output
#         echo "$MODIFIED_CONTENT" >> "$FINAL_OUTPUT"
#         echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
#     else
#         echo "Warning: $CHUNK_OUTPUT not found."
#     fi
    
#     # Clean up the chunked PDF file after processing
#     rm -f "$CHUNK_NAME"
    
#     # Optionally, clean up the output directory for each chunk
#     rm -rf "${OUTPUT_PREFIX}_${i}_output"
# done

# echo "All markdown files have been combined into $FINAL_OUTPUT"
# echo "All PNG files have been copied to $COMBINED_IMAGES_DIR and renamed to avoid conflicts."
# echo "Processing complete."

# # Final progress update
# update_progress 100
# echo "Script completed successfully"


# almost workable

# # Set the full path to pdftk
# PDFTK_PATH="/opt/homebrew/bin/pdftk"

# echo "Script started with arguments: $@"
# set -x  # This will print each command before it's executed

# if [ ! -f "$PDFTK_PATH" ]; then
#     echo "pdftk is not installed or not in the specified path. Please install it or correct the path."
#     exit 1
# fi

# echo "Using pdftk from $PDFTK_PATH"

# # Check if the correct number of arguments is provided
# if [ "$#" -lt 4 ]; then
#     echo "Usage: $0 <input_pdf> <output_prefix> <pages_per_chunk> <max_pages> <task_id> <lang1> [lang2] [lang3] ..."
#     exit 1
# fi

# INPUT_PDF=$1
# OUTPUT_PREFIX=$2
# PAGES_PER_CHUNK=$3
# MAX_PAGES=$4
# TASK_ID=$5
# shift 5 # Shift the first 5 arguments out

# # Collect all languages into a single string
# LANGS=""
# for lang in "$@"
# do
#     LANGS+="$lang,"
# done

# # Set default language to English if no languages are provided
# if [ -z "$LANGS" ]; then
#     LANGS="english"
# else
#     LANGS=${LANGS%,} # Remove trailing comma
# fi

# # Get the total number of pages in the PDF
# TOTAL_PAGES=$($PDFTK_PATH "$INPUT_PDF" dump_data | grep NumberOfPages | awk '{print $2}')

# # If MAX_PAGES is less than 0, set it to TOTAL_PAGES
# if [ $MAX_PAGES -lt 0 ]; then
#     MAX_PAGES=$TOTAL_PAGES
# fi

# # Calculate the number of chunks
# NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))

# # Limit to MAX_PAGES if specified
# if [ $MAX_PAGES -gt 0 ] && [ $MAX_PAGES -lt $TOTAL_PAGES ]; then
#     TOTAL_PAGES=$MAX_PAGES
#     NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))
# fi

# echo "Processing $TOTAL_PAGES pages in $NUM_CHUNKS chunks..."

# # Initialize an empty output file for final markdown output
# FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
# > "$FINAL_OUTPUT"

# # Create a directory to store all combined images
# COMBINED_IMAGES_DIR="${OUTPUT_PREFIX}_combined_images"
# mkdir -p "$COMBINED_IMAGES_DIR"

# # Initialize a counter for renaming PNG files
# COUNTER=1

# # Function to update progress
# update_progress() {
#     local progress=$1
#     curl -X POST -H "Content-Type: application/json" -d "{\"taskId\":\"$TASK_ID\",\"progress\":$progress}" http://localhost:3000/update-progress
# }

# # Split the PDF, process each chunk, and merge results
# for (( i=1; i<=NUM_CHUNKS; i++ ))
# do
#     START=$(( (i-1)*PAGES_PER_CHUNK + 1 ))
#     END=$(( i*PAGES_PER_CHUNK ))
    
#     # Ensure we don't exceed the total number of pages
#     if [ $END -gt $TOTAL_PAGES ]; then
#         END=$TOTAL_PAGES
#     fi
    
#     CHUNK_NAME="${OUTPUT_PREFIX}_${i}.pdf"
#     echo "Creating chunk $i (pages $START to $END)"
#     $PDFTK_PATH "$INPUT_PDF" cat $START-$END output "$CHUNK_NAME"
    
#     echo "Processing chunk $i"
#     marker_single "$CHUNK_NAME" "${OUTPUT_PREFIX}_${i}_output" --batch_multiplier 1 --max_pages $PAGES_PER_CHUNK --langs $LANGS
    
#     # Update progress
#     PROGRESS=$(( i * 100 / NUM_CHUNKS ))
#     update_progress $PROGRESS
    
#     # ... (rest of the script remains the same)
#         # Combine markdown and handle images for the current chunk
#     CHUNK_OUTPUT_DIR="${OUTPUT_PREFIX}_${i}_output/output_${i}"
#     CHUNK_OUTPUT="${CHUNK_OUTPUT_DIR}/output_${i}.md"
    
#     if [ -f "$CHUNK_OUTPUT" ]; then
#         # Read the contents of the markdown file into a variable
#         MODIFIED_CONTENT=$(cat "$CHUNK_OUTPUT")
        
#         # Process all PNG files in the current chunk
#         # Loop through all PNG files in the current chunk
#         for IMG in "${CHUNK_OUTPUT_DIR}"/*.png; do
#             if [ -f "$IMG" ]; then
#                 # Generate a new name for the image using the counter
#                 NEW_IMG_NAME="image_${COUNTER}.png"
#                 cp "$IMG" "${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}"
                
#                 # Replace the old image name with the new image name, including the relative path
#                 MODIFIED_CONTENT=$(echo "$MODIFIED_CONTENT" | sed "s|$(basename "$IMG")|./${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}|g")
                
#                 # Increment the counter
#                 COUNTER=$((COUNTER + 1))
#             fi
#         done

        
#         # Append the modified content to the final output
#         echo "$MODIFIED_CONTENT" >> "$FINAL_OUTPUT"
#         echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
#     else
#         echo "Warning: $CHUNK_OUTPUT not found."
#     fi
    
#     # Clean up the chunked PDF file after processing
#     rm -f "$CHUNK_NAME"
    
#     # Optionally, clean up the output directory for each chunk
#     rm -rf "${OUTPUT_PREFIX}_${i}_output"
# done

# echo "All markdown files have been combined into $FINAL_OUTPUT"
# echo "All PNG files have been copied to $COMBINED_IMAGES_DIR and renamed to avoid conflicts."
# echo "Processing complete."

# # Final progress update
# update_progress 100
# echo "Script completed successfully"

# v5 test

#!/bin/bash

# Set the full path to pdftk
PDFTK_PATH="/opt/homebrew/bin/pdftk"
MARKER_SINGLE_PATH="/Users/wufengjin/.pyenv/shims/marker_single"
# MARKER_SINGLE_PATH=$(which marker_single)
echo "Script started with arguments: $@"
set -x  # This will print each command before it's executed

if [ ! -f "$PDFTK_PATH" ]; then
    echo "pdftk is not installed or not in the specified path. Please install it or correct the path."
    exit 1
fi

echo "Using pdftk from $PDFTK_PATH"

if [ -z "$MARKER_SINGLE_PATH" ] || [ ! -f "$MARKER_SINGLE_PATH" ]; then
    echo "marker_single is not installed or not in the PATH. Please install it or correct the path."
    exit 1
fi

echo "Using marker_single from $MARKER_SINGLE_PATH"

# Check if the correct number of arguments is provided
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 <input_pdf> <output_prefix> <pages_per_chunk> <max_pages> <task_id> <out_put_dir> <lang1> [lang2] [lang3] ..."
    exit 1
fi

INPUT_PDF=$1
OUTPUT_PREFIX=$2
PAGES_PER_CHUNK=$3
MAX_PAGES=$4
TASK_ID=$5
OUTPUT_DIR=$6
shift 6 # Shift the first 5 arguments out

# Collect all languages into a single string
LANGS=""
for lang in "$@"
do
    LANGS+="$lang,"
done

# Set default language to English if no languages are provided
if [ -z "$LANGS" ]; then
    LANGS="english"
else
    LANGS=${LANGS%,} # Remove trailing comma
fi

# Get the total number of pages in the PDF
TOTAL_PAGES=$($PDFTK_PATH "$INPUT_PDF" dump_data | grep NumberOfPages | awk '{print $2}')

# If MAX_PAGES is less than 0, set it to TOTAL_PAGES
if [ $MAX_PAGES -lt 0 ]; then
    MAX_PAGES=$TOTAL_PAGES
fi

# Calculate the number of chunks
NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))

# Limit to MAX_PAGES if specified
if [ $MAX_PAGES -gt 0 ] && [ $MAX_PAGES -lt $TOTAL_PAGES ]; then
    TOTAL_PAGES=$MAX_PAGES
    NUM_CHUNKS=$(( (TOTAL_PAGES + PAGES_PER_CHUNK - 1) / PAGES_PER_CHUNK ))
fi

echo "Processing $TOTAL_PAGES pages in $NUM_CHUNKS chunks..."

# Use a writable directory for the output
mkdir -p "$OUTPUT_DIR"

# Initialize an empty output file for final markdown output
FINAL_OUTPUT="$OUTPUT_DIR/${OUTPUT_PREFIX}_final_output.md"
> "$FINAL_OUTPUT"

# Create a directory to store all combined images
COMBINED_IMAGES_DIR="$OUTPUT_DIR/${OUTPUT_PREFIX}_combined_images"
mkdir -p "$COMBINED_IMAGES_DIR"

# Initialize a counter for renaming PNG files
COUNTER=1

# Function to update progress
update_progress() {
    local progress=$1
    curl -X POST -H "Content-Type: application/json" -d "{\"taskId\":\"$TASK_ID\",\"progress\":$progress}" http://localhost:3000/update-progress
}

# Split the PDF, process each chunk, and merge results
for (( i=1; i<=NUM_CHUNKS; i++ ))
do
    START=$(( (i-1)*PAGES_PER_CHUNK + 1 ))
    END=$(( i*PAGES_PER_CHUNK ))
    
    # Ensure we don't exceed the total number of pages
    if [ $END -gt $TOTAL_PAGES ]; then
        END=$TOTAL_PAGES
    fi
    
    CHUNK_NAME="$OUTPUT_DIR/${OUTPUT_PREFIX}_${i}.pdf"
    echo "Creating chunk $i (pages $START to $END)"
    $PDFTK_PATH "$INPUT_PDF" cat $START-$END output "$CHUNK_NAME"
    
    echo "Processing chunk $i"
    $MARKER_SINGLE_PATH "$CHUNK_NAME" "$OUTPUT_DIR/${OUTPUT_PREFIX}_${i}_output" --batch_multiplier 1 --max_pages $PAGES_PER_CHUNK --langs $LANGS
    
    # Update progress
    PROGRESS=$(( i * 100 / NUM_CHUNKS ))
    update_progress $PROGRESS
    
    # Combine markdown and handle images for the current chunk
    CHUNK_OUTPUT_DIR="$OUTPUT_DIR/${OUTPUT_PREFIX}_${i}_output/output_${i}"
    CHUNK_OUTPUT="${CHUNK_OUTPUT_DIR}/output_${i}.md"
    
    if [ -f "$CHUNK_OUTPUT" ]; then
        # Read the contents of the markdown file into a variable
        MODIFIED_CONTENT=$(cat "$CHUNK_OUTPUT")
        
        # Process all PNG files in the current chunk
        for IMG in "${CHUNK_OUTPUT_DIR}"/*.png; do
            if [ -f "$IMG" ]; then
                # Generate a new name for the image using the counter
                NEW_IMG_NAME="image_${COUNTER}.png"
                cp "$IMG" "${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}"
                
                # Replace the old image name with the new image name, including the relative path
                MODIFIED_CONTENT=$(echo "$MODIFIED_CONTENT" | sed "s|$(basename "$IMG")|./${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}|g")
                
                # Increment the counter
                COUNTER=$((COUNTER + 1))
            fi
        done

        # Append the modified content to the final output
        echo "$MODIFIED_CONTENT" >> "$FINAL_OUTPUT"
        echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
    else
        echo "Warning: $CHUNK_OUTPUT not found."
    fi
    
    # Clean up the chunked PDF file after processing
    rm -f "$CHUNK_NAME"
    
    # Optionally, clean up the output directory for each chunk
    rm -rf "$OUTPUT_DIR/${OUTPUT_PREFIX}_${i}_output"
done

echo "All markdown files have been combined into $FINAL_OUTPUT"
echo "All PNG files have been copied to $COMBINED_IMAGES_DIR and renamed to avoid conflicts."
echo "Processing complete."

# Final progress update
update_progress 100
echo "Script completed successfully"
