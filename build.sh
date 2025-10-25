#!/bin/bash
# Install Tesseract OCR
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install -y tesseract-ocr
    # Install English language data
    sudo apt-get install -y tesseract-ocr-eng
    # Install other languages as needed, e.g.,
    # sudo apt-get install -y tesseract-ocr-spa tesseract-ocr-fra
elif [ -f /etc/redhat-release ]; then
    # RHEL/CentOS
    sudo yum install -y tesseract
    sudo yum install -y tesseract-langpack-eng
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    brew install tesseract
    brew install tesseract-lang
fi

# Install Python dependencies
pip install -r backend/requirements.txt
