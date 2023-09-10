const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const directoryPaths = ['D:/dev/projects/idifier/html', 'D:/dev/projects/idifier/another_folder']; // Paths to directories where files are located
const ignoreExtensions = ['.jsx']; // File extensions to ignore
const htmlTags = ['button', 'input', 'div', 'Img']; // HTML tags to search for
const newAttributeName = 'data-tooltip-id'; // New attribute name to be added

function addUuidToTagsInFiles(directoryPaths, ignoreExtensions, htmlTags, newAttributeName) {
  for (const directoryPath of directoryPaths) {
    if (!fs.existsSync(directoryPath)) {
      console.log("No directory:", directoryPath);
      continue;
    }

    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileExtension = path.extname(filePath);

      if (ignoreExtensions.includes(fileExtension)) {
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const updatedContent = addUuidToTagsInHTML(fileContent, htmlTags, newAttributeName);
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
    }
  }
}

function addUuidToTagsInHTML(htmlContent, htmlTags, newAttributeName) {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(htmlContent);

  for (const tag of htmlTags) {
    const elements = dom.window.document.querySelectorAll(tag);
    for (const element of elements) {
      if (!element.hasAttribute(newAttributeName)) {
        const id = uuid().replace(/-/g, '');
        element.setAttribute(newAttributeName, id);
      }
    }
  }

  return dom.serialize();
}

addUuidToTagsInFiles(directoryPaths, ignoreExtensions, htmlTags, newAttributeName);