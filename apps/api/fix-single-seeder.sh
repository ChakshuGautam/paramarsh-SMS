#!/bin/bash

file=$1

if [ -z "$file" ]; then
  echo "Usage: ./fix-single-seeder.sh <file>"
  exit 1
fi

if [ ! -f "$file" ]; then
  echo "File not found: $file"
  exit 1
fi

echo "Fixing $file..."

# Create a temporary file
tmp_file="${file}.tmp"
cp "$file" "$tmp_file"

# Process the file line by line
awk '
BEGIN { in_metrics = 0; in_return = 0; }
/return {/ { in_return = 1; }
/metrics: {/ && in_return { 
  in_metrics = 1; 
  print $0;
  if (!has_startTime) {
    print "          startTime: new Date(startTime),";
    print "          endTime: new Date(),";
    has_startTime = 1;
  }
  next;
}
/}/ && in_metrics { 
  in_metrics = 0; 
  has_startTime = 0;
}
/errors: errors\.length > 0 \? errors : undefined/ {
  print "        errors: errors.length > 0 ? errors.map(e => typeof e === '\''string'\'' ? new Error(e) : e) : [],";
  print "        warnings: []";
  next;
}
/errors: errors/ && /undefined/ {
  print "        errors: errors.length > 0 ? errors.map(e => typeof e === '\''string'\'' ? new Error(e) : e) : [],";
  print "        warnings: []";
  next;
}
/success: true,/ && in_return && !has_data {
  print $0;
  # Check if this return block needs data field
  getline nextline;
  if (nextline ~ /entityName:/) {
    print nextline;
    has_data = 1;
  } else {
    print nextline;
  }
  next;
}
/}$/ && in_return {
  in_return = 0;
  has_data = 0;
}
{ print $0; }
' "$tmp_file" > "$file"

rm "$tmp_file"
echo "Fixed $file"