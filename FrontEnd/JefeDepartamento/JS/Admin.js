// SIDEBAR
fetch("/FrontEnd/JefeDepartamento/HTML/Sidebar.html")
.then(res => res.text())
.then(data => {
    document.getElementById("sidebar").innerHTML = data;
    lucide.createIcons();
});

// TOPBAR
fetch("/FrontEnd/JefeDepartamento/HTML/Topbar.html")
.then(res => res.text())
.then(data => {
    document.getElementById("topbar").innerHTML = data;
});