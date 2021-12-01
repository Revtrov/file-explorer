// task bar
import Taskbar from "./taskbar.js";
const taskbar = new Taskbar();
document.body.innerHTML = taskbar.getHtml();
taskbar.setWidths();
// code for desktop#
setTimeout(() => {
    let taskbarHeight = document.getElementById("taskbar");
    taskbarHeight = taskbarHeight.offsetHeight;
    console.log(taskbarHeight);
    const desktop = document.getElementById("desktop");
    desktop.style.height = 100 - ((taskbarHeight / window.innerHeight) * 100) + "%";
}, 0)