function parseRoutingTable(routingTableData) {
    routingTableData = routingTableData.toLowerCase();
    var routingTableList = routingTableData.split('\n');
    var mode = '';
    var state = '';
    for (var i = i; i < routingTableList.length; i++) {
        var thisLine = routingTableList[i];
        var thisLineList = thisLine.split(/[\s]+/);
        if (mode == '') {
            if (thisLineList[0] == 'kernel') {
                mode = 'linux';
                continue;
            }
            if (thisLineList[0] == 'interface' && thisLineList[1] == 'list') {
                mode = 'windows';
                state = 'parsing-interfaces';
                continue;
            }
        }
        switch(state) {
            case 'parsing-interfaces':
            break;
        }
    }
}
