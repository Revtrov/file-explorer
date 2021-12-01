export default class Taskbar {
    constructor() {
        const width = window.innerWidth;
    }

    getHtml() {
        return `
        <div class="taskbar" id="taskbar">
            <div id="startButton">
                <img id="startMenuButtonIcon"src="../images/startMenuButtonIcon.png">
            </div>
            <div id="searchBar">
                <input id="searchbarInput"type="text">
            </div>
            <div id="taskView"></div>
            <div id="pinnedApps"></div>
            <div id="hiddenIcons"></div>
            <div id="battery"></div>
            <div id="sound"></div>
            <div id="internetAccess"></div>
            <div id="keyboard"></div>
            <div id="clock"></div>
            <div id="actionCenter"></div>
            <div id="showDesktop"></div>
        </div>
        <link rel="stylesheet" href="../css/taskbar.css">
        ` + document.body.innerHTML;
    }
    setWidths() {
        const ratio = [0.0350109409190372, 0.25091174325309995, 0.0350109409190372, 0.4894237782640408, 0.0175054704595186, 0.0175054704595186, 0.0175054704595186, 0.0175054704595186, 0.0262582056892779, 0.05105762217359591, 0.0350109409190372, 0.007293946024799417]
        let i = 0;
        let string = "";
        let taskbar = document.getElementById("taskbar");
        let percent = 0;
        for (i = 0; i < ratio.length; i++) {
            percent = ratio[i] * 100;
            string = string.concat(percent.toString() + "%" + " ");
        }
        taskbar.style.gridTemplateColumns = string;
    }
}