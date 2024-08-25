Here is a possible README.md file for the provided code:

**Title:** PDF Chunking and Language Processing Script
**Version:** 1.0

**Overview:**
This script takes a PDF file as input, processes it into chunks based on the number of pages per chunk and maximum pages specified, and generates markdown files and PNG images for each chunk. The script also handles language processing using `marker_single` tool.



**Usage:**

* Save this script to a file (e.g., `process_pdf.sh`)
* Make the script executable by running `chmod +x process_pdf.sh`
* Run the script with the following arguments:
	+ `<input_pdf>`: The input PDF file
	+ `<output_prefix>`: The prefix for output markdown files and PNG images
	+ `<pages_per_chunk>`: The number of pages per chunk
	+ `<max_pages>`: The maximum number of pages to process (optional)
	+ `[lang1]`, `[lang2]`, ...: One or more languages to process using `marker_single` tool

Example:
```bash
./process_pdf.sh input.pdf output prefix 10 100 english chinese
```
**Requirements:**

* `pdftk` tool installed and available in the system's PATH
* `marker_single` tool installed and available in the system's PATH (optional)

**Output:**
The script generates two types of files:
1. Markdown files (`*.md`) containing processed text for each chunk.
2. PNG images (`image_*.png`) stored in a directory with the specified prefix.

** Notes:**

* The script assumes that `pdftk` and `marker_single` tools are installed and available in the system's PATH.
* If no languages are provided, the script defaults to processing English (en) only.
* The script cleans up temporary files after processing each chunk.
* Be careful when running this script, as it modifies the original PDF file and generates new files.

**Troubleshooting:**

* Check that `pdftk` and `marker_single` tools are installed and available in the system's PATH.
* Verify that the input PDF file exists and is readable.
* If the script fails to process a chunk, check the error message and try running the script again.
