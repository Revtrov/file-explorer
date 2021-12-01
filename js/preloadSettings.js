window.addEventListener('DOMContentLoaded', () => {

    const settingsWindow = document.getElementById("settingsWindow"),
        electron = require("electron"),
        fs = require("fs"),
        path = require("path"),
        settingsPath = path.normalize(`${__dirname}/settings.json`),
        ipc = electron.ipcRenderer,
        loadTheme = () => {
            if (document.getElementById("themeSetting").checked == true) {
                writeSettings("theme", "dark");
            } else {
                writeSettings("theme", "light");
            }
            if (readSettings().theme == "dark") {
                document.documentElement.style.setProperty('--bg-color', '#2D2D30');
                document.documentElement.style.setProperty('--text-color', '#CCCCCC');
                document.documentElement.style.setProperty('--headbar-bg-color', 'rgba(50, 54, 57, 1)');
                document.documentElement.style.setProperty('--hover-color', 'rgba(255, 255, 255, 0.1)');
            }
            if (readSettings().theme == "light") {
                document.documentElement.style.setProperty('--bg-color', 'white');
                document.documentElement.style.setProperty('--text-color', 'black');
                document.documentElement.style.setProperty('--headbar-bg-color', 'white');
                document.documentElement.style.setProperty('--hover-color', 'rgba(114, 114, 114, 0.1)');
            }
        },

        readSettings = () => {
            let rawSettings = fs.readFileSync(settingsPath);
            settings = JSON.parse(rawSettings);
            return settings;
        },

        writeSettings = (name, value) => {
            let settings = readSettings(settingsPath);
            settings[name] = value;
            fs.writeFileSync(settingsPath, JSON.stringify(settings))
        },

        saveSettingChanges = (selectCssButton, start) => {
            if (start == "start") {
                document.getElementById("customCssSetting").checked = readSettings().customCSS;
            }
            if (start != "start") {
                writeSettings("customCSS", document.getElementById("customCssSetting").checked)
            }
            if (document.getElementById("customCssSetting").checked == true) {
                if (start != "start") {
                    writeSettings("cssURL", document.getElementById("customCssURL").value);
                }
                document.getElementById("customCssURL").value = readSettings().cssURL;
                if (selectCssButton == true) {
                    loadCSS();
                }
            } else {
                loadTheme();
                if (start != "start") {
                    writeSettings("customCSS", false);
                }
                document.getElementById("customCssSetting").checked = false;
                ipc.send('settingsUpdate');
            }

        },

        loadBorderColor = () => {
            let color = document.getElementById("borderColorSetting").value;
            document.documentElement.style.setProperty('--border-color', color);
            writeSettings("borderColor", color);
        },

        onEvent = (id, eventType, code) => {
            document.getElementById(id).addEventListener(eventType, (event) => {
                eval(code);
            });
        },
        loadCSS = (select) => {
            if (select) {

            } else { ipc.send('getFile') }
        }

    if (readSettings().theme == "dark") {
        document.getElementById("themeSetting").checked = true;
    }
    document.documentElement.style.setProperty('--border-color', readSettings().borderColor);
    loadTheme();
    saveSettingChanges(false, "start");
    onEvent("min-btn", "click", `ipc.send('minimizeSettings'); `);
    onEvent("min-btn", "keydown", `if (event.code == "Enter") { ipc.send('minimizeSettings'); }`);
    onEvent("max-btn", "keydown", `if (event.code == "Enter") { ipc.send('maximizeSettings'); }`);
    onEvent("max-btn", "click", `ipc.send('maximizeSettings'); `);
    onEvent("settings-close-btn", "keydown", `if (event.code == "Enter") { ipc.send('closeSettings'); }`);
    onEvent("settings-close-btn", "click", `ipc.send('closeSettings'); `);
    onEvent("themeSetting", "change", `loadTheme()`);
    onEvent("themeSetting", "change", `saveSettingChanges(false)`);
    onEvent("borderColorSetting", "change", `loadBorderColor()`);
    onEvent("customCssButton", "click", `saveSettingChanges(true, "")`);
    onEvent("customCssURL", "change", `saveSettingChanges(false, "")`);
    onEvent("customCssSetting", "change", `saveSettingChanges(false, "")`);


    ipc.on("selected-CSS", (e, path) => {
        document.getElementById("customCssURL").value = path;
    })

});