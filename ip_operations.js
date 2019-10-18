var routeTable = [{
    metric: 0,
    destination: '172.16.0.1',
    mask: '255.255.0.0'
}];
var interfaceList = [{}];

function getMissingData(dataIn) {
    return getMissingDataGrunt(dataIn);
    /*try {
        return getMissingDataGrunt(dataIn);
    } catch (e) {
        return null;
    }*/
}

// take basic data from 1 line of the route table and fill in missing data
function getMissingDataGrunt(dataIn) {
    var dataOut = {
        destination: dataIn.destination,
        destinationList: ip2List(dataIn.destination),
        destinationVersion: getVersion(dataIn.destination),

        mask: dataIn.mask,
        maskList: ip2List(dataIn.mask),
        maskVersion: getVersion(dataIn.mask)
    };
    validIP(dataOut.destinationList, dataOut.destinationVersion);
    validIP(dataOut.maskList, dataOut.maskVersion);

    if (dataOut.destinationVersion != dataOut.maskVersion) throw 'dest ' +
    dataOut.destination + ' is ipv' + dataOut.destinationVersion +
    ' but mask ' + dataOut.mask + ' is ipv' + dataOut.maskVersion;

    var hostStartList = []; // init
    var hostEndList = []; // init
    for (var i = 0; i < dataOut.destinationList.length; i++) {
        hostStartList[i] = dataOut.destinationList[i] & dataOut.maskList[i];
        hostEndList[i] = dataOut.destinationList[i] | binInvert(dataOut.maskList[i], dataOut.maskVersion);
    }
    hostStartList[hostStartList.length - 1]++;
    dataOut.hostStartList = hostStartList;

    hostEndList[hostEndList.length - 1]--;
    dataOut.hostEndList = hostEndList;
    return dataOut;
}

function mask2Bits(mask) {
    var maskBin = ip2bin(mask);
    var foundAZero = false;
    var bits = 0;
    for (var i = 0; i < maskBin.length; i++) {
        if (maskBin[i] == '1') {
            if (foundAZero) throw 'invalid mask: ' + mask + ' (non contiguous bits are not supported)';
            else bits++;
        } else foundAZero = true;
    }
    return bits;
}

function validIP(ipList, version) {
    for (var i = 0; i < version; i++) {
        if ((typeof ipList[i] != 'number') || (ipList[i] < 0)) return false;
        switch (version) {
            case 4: if (ipList[i] > 0xff) return false;
            case 6: if (ipList[i] > 0xffff) return false;
        }
    }
    return true;
}

function getVersion(ip) {
    if (ip.indexOf('.') != -1) return 4;
    if (ip.indexOf(':') != -1) return 6;
    throw 'unknown ip version: ' + ip;
}

function ip2List(ip) {
    var version = getVersion(ip);
    var ipList = []; // init
    switch (version) {
        case 4:
            ipList = ip.split('.');
            break;
        case 6:
            ipList = ip.split(':');
            break;
    }
    for (var i = 0; i < version; i++) {
        switch (version) {
            case 4:
                ipList[i] = parseInt(ipList[i]);
                break;
            case 6:
                ipList[i] = parseInt(ipList[i], 16);
                break;
        }
    }
    return ipList;
}

function ipList2IP(ipList) {
    var version = (ipList.length == 4) ? 4 : 6;
    var delimiter = (version == 4) ? '.' : ':';
    for (var i = 0; i < ipList.length; i++) {
        ipList[i] = ipList[i].toString(version == 4 ? 10 : 16);
    }
    return ipList.join(delimiter);
}

function ip2bin(ip) {
    var ipList = ip2List(ip);
    var ipBinList = [];
    for (var i = 0; i < ipList.length; i++) {
        ipBinList.push(ipList[i].toString(2));
    }
    return ipBinList.join('');
}

function binInvert(int, version) {
    switch (version) {
        case 4: return 0xff - int;
        case 6: return 0xffff - int;
    }
}

for (var i = 0; i < routeTable.length; i++) {
    console.log(getMissingData(routeTable[i]));
}
