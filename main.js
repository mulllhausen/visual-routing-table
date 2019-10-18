document.getElementById('parseRoutingTable').onclick = function() {
    var routingTableData = document.getElementsByTagName('textarea')[0].value;
    parseRoutingTable(routingTableData);
};
