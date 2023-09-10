const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { v4: uuid } = require('uuid');

const { JSDOM } = jsdom;
const absolutePaths = ['D:/dev/projects/idifier/html'];
const tags = ['button', 'link', 'input'];
const extensions = ['.jsx'];

function replaceFilesInDir(paths, filterExtensions, tags, attrToAdd = 'data-tooltip-id') {
    for (const startPath of paths) {
        if (!fs.existsSync(startPath)) {
            console.log("no dir ", startPath);
            continue;
        }

        const files = fs.readdirSync(startPath);
        for (const file of files) {
            const filename = path.join(startPath, file);
            const stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                replaceFilesInDir([filename], filterExtensions, tags, attrToAdd);
            } else {
                for (const filter of filterExtensions) {
                    if (filename.endsWith(filter)) {
                        continue;
                    }
                    let fileContent = fs.readFileSync(filename, 'utf-8')
                    const dom = new JSDOM(fileContent, { includeNodeLocations: true });
                    let posChange = 0;
                    for (const tag of tags) {
                        const elements = dom.window.document.querySelectorAll(tag)
                        for (const element of elements) {
                            let { startOffset, endOffset, startLine } = dom.nodeLocation(element);
                            console.info(`Checking if element [filename=${filename.split('/').pop()}, line=${startLine}, tagName=${element.tagName}] has attribute ${attrToAdd}`)

                            if (element.hasAttribute(attrToAdd)) {
                                continue;
                            }

                            const id = uuid().replace(/-/g, '');

                            startOffset += posChange;
                            endOffset += posChange;

                            const target = fileContent.substring(startOffset, endOffset);

                            if (!target.startsWith(`<${tag}`)) {
                                continue;
                            }

                            const suffix = fileContent.substring(startOffset + 1 + tag.length, endOffset);

                            fileContent = fileContent.replace(target, `<${tag} ${attrToAdd}="${id}"${suffix}`)
                            posChange += id.length + 4 + attrToAdd.length
                        }
                    }
                    fs.writeFileSync(filename, fileContent, 'utf-8')
                }
            }
        }
    }
}

for (const tag of tags) {
    replaceFilesInDir(absolutePaths, extensions, tags)
}