#!/bin/bash
echo "Enter the bucket name you want to copy the files to, note you must be signed in to AWS Cli"
read -r BUCKET_NAME
echo "BUCKET: $BUCKET_NAME"

# Copy javascript
aws s3 cp --content-type application/javascript --exclude "*" --include "*.js" --recursive .output/app s3://"$BUCKET_NAME"/

# Copy css
aws s3 cp --content-type text/css --exclude "*" --include "*.css" --recursive .output/app s3://"$BUCKET_NAME"/

# Copy only html files
#aws s3 cp --content-type text/html --exclude "*.json" --recursive ./static_test s3://"$BUCKET_NAME"/

# Copy only *.props.json
#aws s3 cp --content-type application/json --exclude "*" --include "*.json" --recursive ./static_test s3://"$BUCKET_NAME"/
