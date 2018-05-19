
function iconBuild(icons){
    for (var i=1; i <= 97; i++) {
        icons.push({'iconFilePath': '/public/icons/' + i + '.png', 'iconValue': i});
    }
}