window.addEventListener('DOMContentLoaded', () => {

    let fileClickable = true,
        buttonState = 0,
        startingFilePath, settings, fileType;

    const electron = require("electron"),
        ipc = electron.ipcRenderer,
        fs = require("fs"),
        path = require("path"),
        settingsPath = path.normalize(`${__dirname}/js/settings.json`),
        settingsBtn = "settings",
        dropdownBtn = document.getElementById("dropdownBtn"),
        folderNameBtn = document.getElementById("folderName"),
        fileContainer = document.getElementById("files"),
        viewport = document.getElementById("viewport"),
        viewImg = document.getElementById("viewImg"),
        viewVideo = document.getElementById("viewVideo"),
        viewText = document.getElementById("viewText"),
        libre = require('libreoffice-convert'),
        init = () => {

            const dropdownBtnPress = () => {
                    if (buttonState <= 1) {
                        dropdownBtn.innerHTML = "∨";
                        dropdownBtn.style.transform = "scaleX(1.4) scaleY(0.8)";
                        dropdownBtn.style.top = "107.375px";
                        fileContainer.style.opacity = 1;
                        fileClickable = true;
                        buttonState++;
                    }
                    if (buttonState >= 2) {
                        dropdownBtn.innerHTML = "〉";
                        dropdownBtn.style.transform = "scaleX(1.3) scaleY(0.8)";
                        dropdownBtn.style.top = "105.375px";
                        fileContainer.style.opacity = 0;
                        fileClickable = false;
                        buttonState = 0;
                    }
                },
                convDOCX = (url, ext) => {;
                    const extend = ext,
                        enterPath = url,
                        outputPath = path.join(__dirname, `/converted${extend}`);

                    // Read file
                    const file = fs.readFileSync(enterPath);
                    // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
                    libre.convert(file, extend, undefined, (err, done) => {
                        if (err) {
                            console.log(`Error converting file: ${err}`);
                        }

                        // Here in done you have pdf file which you can save or transfer in another stream
                        fs.writeFileSync(outputPath, done);
                    });
                }

            readSettings = () => {
                    let rawSettings = fs.readFileSync(settingsPath);
                    settings = JSON.parse(rawSettings);
                    return settings;
                },

                onEvent = (id, eventType, code) => {
                    document.getElementById(id).addEventListener(eventType, (event) => {
                        eval(code);
                    });
                },

                writeSettings = (name, value) => {
                    let settings = readSettings(settingsPath);
                    settings[name] = value;
                    fs.writeFileSync(settingsPath, JSON.stringify(settings))
                },

                saveFileURL = (url) => {
                    console.log(url)
                    writeSettings("fileURL", readSettings().folderURL + "\\" + url);
                },

                state = (array, name) => {
                    viewport.style.zIndex = array[0] + 100;
                    viewport.style.opacity = array[0];
                    viewImg.style.zIndex = array[1] + 100;
                    viewImg.style.opacity = array[1];
                    viewVideo.style.zIndex = array[2] + 100;
                    viewVideo.style.opacity = array[2];
                    viewText.style.zIndex = array[3] + 100;
                    viewText.style.opacity = array[3];
                    if (array[2] == 0) {
                        viewVideo.src = "";
                    }
                    saveFileURL(name);
                    viewImg.title = readSettings().fileURL.substr(name);
                    viewport.title = readSettings().fileURL.substr(name);
                    viewVideo.title = readSettings().fileURL.substr(name);
                    document.getElementById("fileTitle").innerHTML = readSettings().fileURL.substr(name);
                },

                loadFile = (name, first, ext) => {
                    if (ext == ".pdf") {
                        viewport.type = fileType;
                        viewport.src = readSettings().folderURL + "\\" + name;
                        viewport.type = "application/pdf";
                        if (first == true) {
                            viewport.src = readSettings().fileURL;
                        }

                        state([1, 0, 0, 0], name);
                    }
                    if (ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".jfif" || ext == ".gif") {
                        viewImg.src = readSettings().folderURL + "\\" + name;
                        state([0, 1, 0, 0], name);
                    }
                    if (ext == ".mp4" || ext == ".wav" || ext == ".webm" || ext == ".mp3") {
                        viewVideo.src = readSettings().folderURL + "\\" + name;
                        state([0, 0, 1, 0], name);
                    }
                    if (ext == ".txt" || ext == ".md" || ext == ".docx") {
                        state([0, 0, 0, 1], name);
                        console.log(readSettings().fileURL)
                        let text = fs.readFileSync(readSettings().fileURL, "utf8");
                        document.getElementById("viewText").innerHTML = text;
                    }
                },

                loadFolderName = () => {
                    let string = readSettings().folderURL;
                    let folderName = string.split('\\').pop();
                    folderNameBtn.innerHTML = folderName;
                    console.log(folderName);
                },

                loadFileInFolderNames = (name, type, ext) => {
                    let file = document.createElement("div");
                    file.setAttribute("id", name)
                    fileContainer.appendChild(file);
                    let files = document.getElementById(name);
                    fileType = type;
                    files.innerHTML = name;
                    files.tabIndex = 0;
                    files.classList.add('filesInFolder');
                    files.addEventListener("click", () => {
                        if (fileClickable == true) {
                            loadFile(name, 0, ext);
                        }
                    })
                    files.addEventListener('keydown', (event) => {
                        if (event.code == "Enter") {
                            if (fileClickable == true) {
                                loadFile(name, 0, ext);
                            }
                        }
                    })

                },

                fileSearch = (file, extension, type) => {
                    if (file.substring(file.indexOf(extension)) == extension) {
                        loadFileInFolderNames(file, type, extension);
                    }
                },

                getFileExtension = (array) => {
                    let extStartPos = startingFilePath.lastIndexOf('.');
                    return startingFilePath.substr(extStartPos);
                },

                loadFileInFolder = (path, first) => {
                    fileContainer.innerHTML = "";
                    if (first == false) {
                        writeSettings("folderURL", path[0]);
                        loadFolderName();
                        let directory = JSON.stringify(path[0]).substring(JSON.stringify(path[0]).indexOf("\\"));
                        directory = directory.substring(0, directory.length - 1);
                        fs.readdir("/" + directory, (err, files) => {
                            if (err)
                                console.log(err);
                            else {
                                files.forEach(file => {
                                    fileSearch(file, ".pdf", "application/pdf");
                                    fileSearch(file, ".jpg", "image/jpg");
                                    fileSearch(file, ".png", "image/png");
                                    fileSearch(file, ".mp4", "video/webm");
                                    fileSearch(file, ".wav", "audio/webm");
                                    fileSearch(file, ".webm", "video/webm");
                                    fileSearch(file, ".txt", "application/pdf");
                                    fileSearch(file, ".md", "application/pdf");
                                    fileSearch(file, ".docx", "application/pdf");
                                })
                            }
                        });
                    }
                    if (first == true) {
                        console.log(path)
                        writeSettings("folderURL", path);
                        loadFolderName();
                        fs.readdir(path, (err, files) => {
                            if (err)
                                console.log(err);
                            else {
                                files.forEach(file => {
                                    fileSearch(file, ".pdf", "application/pdf");
                                    fileSearch(file, ".jpg", "image/jpg");
                                    fileSearch(file, ".png", "image/png");
                                    fileSearch(file, ".mp4", "video/webm");
                                    fileSearch(file, ".wav", "audio/webm");
                                    fileSearch(file, ".webm", "video/webm");
                                    fileSearch(file, ".txt", "application/pdf");
                                    fileSearch(file, ".md", "application/pdf");
                                    fileSearch(file, ".docx", "application/pdf");
                                })
                            }
                        });
                    }
                },

                loadTheme = () => {
                    switch (readSettings().theme) {
                        case "dark":
                            document.documentElement.style.setProperty('--bg-color', '#2D2D30');
                            document.documentElement.style.setProperty('--text-color', '#CCCCCC');
                            document.documentElement.style.setProperty('--headbar-bg-color', 'rgba(50, 54, 57, 1)');
                            document.documentElement.style.setProperty('--hover-color', 'rgba(255, 255, 255, 0.1)');
                            break
                        case "light":
                            document.documentElement.style.setProperty('--bg-color', 'white');
                            document.documentElement.style.setProperty('--text-color', 'black');
                            document.documentElement.style.setProperty('--headbar-bg-color', 'white');
                            document.documentElement.style.setProperty('--hover-color', 'rgba(114, 114, 114, 0.1)');
                            break
                    }
                },
                loadCSS = (path) => {
                    writeSettings("cssURL", path[0]);
                    let css = document.createElement("link");
                    css.setAttribute("id", "addedCSS");
                    document.body.appendChild(css);
                    css = document.getElementById("addedCSS");
                    css.rel = "stylesheet";
                    css.href = readSettings().cssURL;
                }
            startingFilePath = readSettings().fileURL;
            readSettings();
            loadFolderName();
            loadFileInFolderNames();
            loadFileInFolder(readSettings().folderURL, true, getFileExtension());
            dropdownBtnPress();
            loadTheme();
            let name = readSettings().fileURL.lastIndexOf('\\') + 1;
            loadFile(readSettings().fileURL.substr(name), false, getFileExtension());
            viewImg.title = readSettings().fileURL.substr(name);
            document.documentElement.style.setProperty('--border-color', readSettings().borderColor);
            onEvent("min-btn", "click", `ipc.send('minimize'); `);
            onEvent("min-btn", "keydown", `if (event.code == "Enter") { ipc.send('minimize'); }`);
            onEvent("max-btn", "keydown", `if (event.code == "Enter") { ipc.send('maximize'); }`);
            onEvent("max-btn", "click", `ipc.send('maximize'); `);
            onEvent("close-btn", "keydown", `if (event.code == "Enter") { ipc.send('close'); }`);
            onEvent("close-btn", "click", `ipc.send('close'); `);
            onEvent("add", "keydown", `if (event.code == "Enter") { ipc.send('openFolder'); }`);
            onEvent("add", "click", `ipc.send('openFolder'); `);
            onEvent(settingsBtn, "keydown", `if (event.code == "Enter") { ipc.send('openSettings');}`);
            onEvent(settingsBtn, "click", `ipc.send('openSettings');`);
            onEvent("folderName", "keydown", `if (event.code == "Enter") { dropdownBtnPress();}`);
            onEvent("folderName", "click", ` dropdownBtnPress();`);
            ipc.on('settingsUpdate', function(e) {
                console.log("asdasd")
                loadTheme();
                document.documentElement.style.setProperty('--border-color', readSettings().borderColor);
            });
            ipc.on('selected-file', function(e, path) {
                loadFileInFolder(path, false);

            });
            ipc.on('selected-CSS', function(e, path) {
                loadCSS(path[0]);
            });
        }

    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            init();
        }
    };
})