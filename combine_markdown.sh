

# # Combine all markdown files into one file
# OUTPUT_PREFIX=$1
# NUM_CHUNKS=$2

# # Initialize an empty output file
# FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
# > "$FINAL_OUTPUT"

# # Loop through all chunks and concatenate their markdown files into the final output
# for (( i=1; i<=NUM_CHUNKS; i++ ))
# do
#     CHUNK_OUTPUT="${OUTPUT_PREFIX}_${i}_output/output_${i}/output_${i}.md"
#     if [ -f "$CHUNK_OUTPUT" ]; then
#         cat "$CHUNK_OUTPUT" >> "$FINAL_OUTPUT"
#         echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
#     else
#         echo "Warning: $CHUNK_OUTPUT not found."
#     fi
# done

# echo "All markdown files have been combined into $FINAL_OUTPUT"


# v2-----------

# Combine all markdown files into one file and move all PNG files to a single directory
# OUTPUT_PREFIX=$1
# NUM_CHUNKS=$2

# # Initialize an empty output file
# FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
# > "$FINAL_OUTPUT"

# # Create a directory to store all combined images
# COMBINED_IMAGES_DIR="${OUTPUT_PREFIX}_combined_images"
# mkdir -p "$COMBINED_IMAGES_DIR"

# # Loop through all chunks and concatenate their markdown files into the final output
# for (( i=1; i<=NUM_CHUNKS; i++ ))
# do
#     CHUNK_OUTPUT_DIR="${OUTPUT_PREFIX}_${i}_output/output_${i}"
#     CHUNK_OUTPUT="${CHUNK_OUTPUT_DIR}/output_${i}.md"
    
#     if [ -f "$CHUNK_OUTPUT" ]; then
#         # Update image paths in the markdown file and append to final output
#         sed "s#\(\!\[.*\](\)\(.*\.png\))#\1${COMBINED_IMAGES_DIR}/\2#g" "$CHUNK_OUTPUT" >> "$FINAL_OUTPUT"
#         echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
        
#         # Move PNG files to the combined images directory
#         mv "${CHUNK_OUTPUT_DIR}"/*.png "$COMBINED_IMAGES_DIR"
#     else
#         echo "Warning: $CHUNK_OUTPUT not found."
#     fi
# done

# echo "All markdown files have been combined into $FINAL_OUTPUT"
# echo "All PNG files have been moved to $COMBINED_IMAGES_DIR"


# v3

# Combine all markdown files into one file and move all PNG files to a single directory with renaming
# OUTPUT_PREFIX=$1
# NUM_CHUNKS=$2

# # Initialize an empty output file
# FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
# > "$FINAL_OUTPUT"

# # Create a directory to store all combined images
# COMBINED_IMAGES_DIR="${OUTPUT_PREFIX}_combined_images"
# mkdir -p "$COMBINED_IMAGES_DIR"

# # Initialize a counter for renaming PNG files
# COUNTER=1

# Loop through all chunks
# for (( i=1; i<=NUM_CHUNKS; i++ ))
# do
#     CHUNK_OUTPUT_DIR="${OUTPUT_PREFIX}_${i}_output/output_${i}"
#     CHUNK_OUTPUT="${CHUNK_OUTPUT_DIR}/output_${i}.md"
    
#     if [ -f "$CHUNK_OUTPUT" ]; then
#         # Process all PNG files in the current chunk
#         for IMG in "${CHUNK_OUTPUT_DIR}"/*.png; do
#             if [ -f "$IMG" ]; then
#                 # Generate a new name for the image using the counter
#                 NEW_IMG_NAME="image_${COUNTER}.png"
#                 cp "$IMG" "${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}"
#                 # Debugging: Print the old and new image names
#                 echo "Replacing $(basename "$IMG") with ${NEW_IMG_NAME} in $CHUNK_OUTPUT"

#                 # Replace the old image name with the new image name in the markdown file
#                 sed -i "s#$(basename "$IMG")#${NEW_IMG_NAME}#g" "$CHUNK_OUTPUT"
                
                
#                 # Increment the counter
#                 COUNTER=$((COUNTER + 1))
#             fi
#         done
        
#         # Append the modified markdown to the final output
#         cat "$CHUNK_OUTPUT" >> "$FINAL_OUTPUT"
#         echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
#     else
#         echo "Warning: $CHUNK_OUTPUT not found."
#     fi
# done

# echo "All markdown files have been combined into $FINAL_OUTPUT"
# echo "All PNG files have been moved to $COMBINED_IMAGES_DIR and renamed to avoid conflicts."

#  v4 

# # Combine all markdown files into one file and move all PNG files to a single directory with renaming
# OUTPUT_PREFIX=$1
# NUM_CHUNKS=$2

# # Initialize an empty output file
# FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
# > "$FINAL_OUTPUT"

# # Create a directory to store all combined images
# COMBINED_IMAGES_DIR="${OUTPUT_PREFIX}_combined_images"
# mkdir -p "$COMBINED_IMAGES_DIR"

# # Initialize a counter for renaming PNG files
# COUNTER=1

# # Loop through all chunks
# for (( i=1; i<=NUM_CHUNKS; i++ ))
# do
#     CHUNK_OUTPUT_DIR="${OUTPUT_PREFIX}_${i}_output/output_${i}"
#     CHUNK_OUTPUT="${CHUNK_OUTPUT_DIR}/output_${i}.md"
    
#     if [ -f "$CHUNK_OUTPUT" ]; then
#         # Process all PNG files in the current chunk
#         for IMG in "${CHUNK_OUTPUT_DIR}"/*.png; do
#             if [ -f "$IMG" ]; then
#                 # Generate a new name for the image using the counter
#                 NEW_IMG_NAME="image_${COUNTER}.png"
#                 cp "$IMG" "${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}"
                
#                 # Debugging: Print the old and new image names
#                 echo "Replacing $(basename "$IMG") with ${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME} in $CHUNK_OUTPUT"
                
#                 # Replace the old image name with the new image name, including the relative path
#                 sed -i '' "s|$(basename "$IMG")|./${COMBINED_IMAGES_DIR}/${NEW_IMG_NAME}|g" "$CHUNK_OUTPUT"
                
#                 # Increment the counter
#                 COUNTER=$((COUNTER + 1))
#             fi
#         done
        
#         # Append the modified markdown to the final output
#         cat "$CHUNK_OUTPUT" >> "$FINAL_OUTPUT"
#         echo -e "\n\n" >> "$FINAL_OUTPUT"  # Add spacing between chunks
#     else
#         echo "Warning: $CHUNK_OUTPUT not found."
#     fi
# done

# echo "All markdown files have been combined into $FINAL_OUTPUT"
# echo "All PNG files have been copied to $COMBINED_IMAGES_DIR and renamed to avoid conflicts."

# v5

#!/bin/bash

# Combine all markdown files into one file and move all PNG files to a single directory with renaming
OUTPUT_PREFIX=$1
NUM_CHUNKS=$2

# Initialize an empty output file
FINAL_OUTPUT="${OUTPUT_PREFIX}_final_output.md"
> "$FINAL_OUTPUT"

# Create a directory to store all combined images
COMBINED_IMAGES_DIR="${OUTPUT_PREFIX}_combined_images"
mkdir -p "$COMBINED_IMAGES_DIR"

# Initialize a counter for renaming PNG files
COUNTER=1

# Loop through all chunks
for (( i=1; i<=NUM_CHUNKS; i++ ))
do
    CHUNK_OUTPUT_DIR="${OUTPUT_PREFIX}_${i}_output/output_${i}"
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
done

echo "All markdown files have been combined into $FINAL_OUTPUT"
echo "All PNG files have been copied to $COMBINED_IMAGES_DIR and renamed to avoid conflicts."

