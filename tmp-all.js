// static properties
var svg = document.getElementById('routeTable');
var svgDefs = svg.getElementsByTagName('defs')[0];
var svgProperties = {
    overallHeight: 400, // gets updated to match the svg
    overallWidth: 400, // gets updated to fit elements
    topHalfHeight: 0, // gets updated to fit elements
    fontSize: 12,
    areaBorderWidth: 1,

        verticalGapBeforeAndAfterIPRange: 20, // the gap before the ip ranges, repeated at the bottom too
    ipTextVerticalMargin: 4,
    ipLeft: 113, // the left position of the ip ranges
    ipHorizontalMargin: 2,
    ipColors: [
        'blue'//,'green', 'red', 'purple'
    ],

        deviceSquareHeight: 100, // the height for interfaces and gateways
    interfaceLeft: 260, // the left position of the interfaces
    minVerticalGapBetweenInterfaces: 10,
    verticalGapBeforeAndAfterInterfaces: 30, // the gap before interfaces, repeated at the bottom too

    gatewayLeft: 460, // the left position of the gateways
    minVerticalGapBetweenGateways: 10,
    verticalGapBeforeAndAfterGateways: 30, // the gap before gateways, repeated at the bottom too

    externalDestinationLeft: 650, // the left position of the external destination
    verticalGapBetweenOtherNicAndGateways: 70,
    verticalGapAfterOtherNic: 20
};


var windowsRouteTableData = '$ route print\n===========================================================================\nInterface List\n 11...74 2b 62 88 a6 6e ......Intel(R) Ethernet Connection I217-LM\n  1...........................Software Loopback Interface 1\n 31...00 00 00 00 00 00 00 e0 Microsoft ISATAP Adapter\n 16...00 00 00 00 00 00 00 e0 Teredo Tunneling Pseudo-Interface\n===========================================================================\n\nIPv4 Route Table\n===========================================================================\nActive Routes:\nNetwork Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0      192.168.0.3     192.168.0.65     20\n        127.0.0.0        255.0.0.0         On-link         127.0.0.1    306\n        127.0.0.1  255.255.255.255         On-link         127.0.0.1    306\n  127.255.255.255  255.255.255.255         On-link         127.0.0.1    306\n       172.16.0.0      255.255.0.0      192.168.0.1     192.168.0.65     21\n       172.16.0.0    255.255.255.0      192.168.0.1     192.168.0.65     21\n      192.168.0.0    255.255.255.0         On-link      192.168.0.65    276\n     192.168.0.65  255.255.255.255         On-link      192.168.0.65    276\n    192.168.0.255  255.255.255.255         On-link      192.168.0.65    276\n      192.168.3.0    255.255.255.0      192.168.0.1     192.168.0.65     21\n      192.168.5.0    255.255.255.0      192.168.0.1     192.168.0.65     21\n    203.41.188.96  255.255.255.240      192.168.0.1     192.168.0.65     21\n    203.42.70.224  255.255.255.240      192.168.0.1     192.168.0.65     21\n    203.44.43.160  255.255.255.240      192.168.0.1     192.168.0.65     21\n       203.52.0.0    255.255.254.0      192.168.0.1     192.168.0.65     21\n        224.0.0.0        240.0.0.0         On-link         127.0.0.1    306\n        224.0.0.0        240.0.0.0         On-link      192.168.0.65    276\n  255.255.255.255  255.255.255.255         On-link         127.0.0.1    306\n  255.255.255.255  255.255.255.255         On-link      192.168.0.65    276\n===========================================================================\nPersistent Routes:\n  Network Address          Netmask  Gateway Address  Metric\n       172.16.0.0    255.255.255.0      192.168.0.1       1\n===========================================================================\n\nIPv6 Route Table\n===========================================================================\nActive Routes:\n If Metric Network Destination      Gateway\n  1    306 ::1/128                  On-link\n  1    306 ff00::/8                 On-link\n===========================================================================\nPersistent Routes:\n  None';

var linuxRouteTableData1 = '$ route -n\nKernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\n0.0.0.0         192.168.1.1     0.0.0.0         UG    0      0        0 eth0\n172.16.0.0      192.168.0.1     255.255.0.0     UG    0      0        0 eth1\n192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 eth1\n192.168.1.0     0.0.0.0         255.255.255.0   U     0      0        0 eth0\n';

var linuxRouteTableData2 = '$ route -ve\nKernel IP routing table\nDestination     Gateway         Genmask         Flags   MSS Window  irtt Iface\ndefault         ado1            0.0.0.0         UG        0 0          0 eth0\n172.16.0.0      telstra_wan_gw  255.255.0.0     UG        0 0          0 eth1\n192.168.0.0     *               255.255.255.0   U         0 0          0 eth1\n192.168.1.0     *               255.255.255.0   U         0 0          0 eth0';

var macOSRouteTableData = '$ netstat -rn\nRouting tables\n\n\n\nInternet:\n\nDestination        Gateway            Flags        Refs      Use   Netif Expire\n\ndefault            192.168.1.1        UGSc          192        0     en0       \n\n127                127.0.0.1          UCS             0        0     lo0       \n\n127.0.0.1          127.0.0.1          UH              1      248     lo0       \n\n169.254            link#5             UCS             1        0     en0      !\n\n192.168.1          link#5             UCS             1        0     en0      !\n\n192.168.1.1/32     link#5             UCS             1        0     en0      !\n\n192.168.1.1        68:ff:7b:dd:e7:26  UHLWIir        68     1450     en0   1144\n\n192.168.1.101      84:be:52:41:a4:d2  UHLWI           0        0     en0   1073\n\n192.168.1.103/32   link#5             UCS             0        0     en0      !\n\n224.0.0/4          link#5             UmCS            2        0     en0      !\n\n224.0.0.251        1:0:5e:0:0:fb      UHmLWI          0        0     en0       \n\n239.255.255.250    1:0:5e:7f:ff:fa    UHmLWI          0      540     en0       \n\n255.255.255.255/32 link#5             UCS             0        0     en0      !';

// events
function z2GroupPathClicked() {
    var allPaths = svg.querySelectorAll('#z2 g.ipRange');
  for (var i = 0; i < allPaths.length; i++) {
    var path = allPaths[i];
    path.classList.remove('clicked');
  }
  if (this.tagName.toLowerCase() == 'g') {
        this.classList.add('clicked');
  }
}

document.getElementById('loadWindows').onclick = function() {
    loadRouteTable(windowsRouteTableData);
}
document.getElementById('loadLinux1').onclick = function() {
  loadRouteTable(linuxRouteTableData1);
}
document.getElementById('loadLinux2').onclick = function() {
  loadRouteTable(linuxRouteTableData2);
}
document.getElementById('loadMacOS').onclick = function() {
  loadRouteTable(macOSRouteTableData);
}

function loadRouteTable(text) {
document.getElementById('inputRouteTable').value = text;
}

initSVGProperties();

// take basic data from 1 line of the route table and fill in missing data
function getMissingData(dataIn) {
    var dataOut = {
    destination: dataIn.destination,
    destinationList: ip2List(dataIn.destination),
    destinationIPVersion: getIPVersion(dataIn.destination),

    mask: dataIn.mask,
    maskList: ip2List(dataIn.mask),
    maskIPVersion: getIPVersion(dataIn.mask),

    interface: dataIn.interface,
    gateway: dataIn.gateway
  };
  validIP(dataOut.destinationList, dataOut.destinationIPVersion);
  validIP(dataOut.maskList, dataOut.maskIPVersion);

  if (dataOut.destinationIPVersion != dataOut.maskIPVersion) throw 'dest ' +
  dataOut.destination + ' is ipv' + dataOut.destinationIPVersion +
  ' but mask ' + dataOut.mask + ' is ipv' + dataOut.maskIPVersion;

  var hostStartList = []; // init
  var hostEndList = []; // init
  for (var i = 0; i < dataOut.destinationList.length; i++) {
    hostStartList[i] = dataOut.destinationList[i] & dataOut.maskList[i];
    hostEndList[i] = dataOut.destinationList[i] | binInvert(dataOut.maskList[i], dataOut.maskIPVersion);
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

function validIP(ipList, ipVersion) {
    for (var i = 0; i < ipVersion; i++) {
    if ((typeof ipList[i] != 'number') || (ipList[i] < 0)) return false;
    switch (ipVersion) {
        case 4: if (ipList[i] > 0xff) return false;
      case 6: if (ipList[i] > 0xffff) return false;
    }
  }
  return true;
}

function getIPVersion(ip) {
  if (ip.indexOf('.') != -1) return 4;
  if (ip.indexOf(':') != -1) return 6;
  throw 'unknown ip version: ' + ip;
}

function ip2List(ip) {
    var ipVersion = getIPVersion(ip);
  var ipList = []; // init
  switch (ipVersion) {
    case 4:
        ipList = ip.split('.');
      break;
    case 6:
        ipList = ip.split(':');
      break;
  }
  for (var i = 0; i < ipList.length; i++) {
    switch (ipVersion) {
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
  var ipVersion = (ipList.length == 4) ? 4 : 6;
  var delimiter = (ipVersion == 4) ? '.' : ':';
  var newIPList = [];
  for (var i = 0; i < ipList.length; i++) {
    newIPList.push(ipList[i].toString(ipVersion == 4 ? 10 : 16));
  }
  return newIPList.join(delimiter);
}

function ipList2Int(ipList) {
    if (ipList.length != 4) throw 'ipList2Hex only supports ipv4 addresses';
  var ipHex = ''; // init
  for (var i = 0; i < ipList.length; i++) {
    var hex = ipList[i].toString(16);
    if (hex.length == 1) hex = '0' + hex;
    ipHex += hex;
  }
  return parseInt(ipHex, 16);
}

function ip2bin(ip) {
    var ipList = ip2List(ip);
  var ipBinList = [];
  for (var i = 0; i < ipList.length; i++) {
    ipBinList.push(ipList[i].toString(2));
  }
  return ipBinList.join('');
}

function binInvert(int, ipVersion) {
    switch (ipVersion) {
    case 4: return 0xff - int;
    case 6: return 0xffff - int;
  }
}

document.getElementById('parseRoutingTable').onclick = function() {
        svg.style.display = 'inline';
        clearSVG();
    var routingTableStr = document.getElementsByTagName('textarea')[0].value;
    var routingTableData = parseRoutingTable(routingTableStr);
    try {
        for (var i = 0; i < routingTableData.routes.length; i++) {
            routingTableData.routes[i] = getMissingData(routingTableData.routes[i]);

            var routingTableLine = routingTableData.routes[i];
            if (
                (routingTableData.minIPList == null)
              || (ipList2Int(routingTableData.minIPList) > ipList2Int(routingTableLine.hostStartList))
            ) routingTableData.minIPList = routingTableLine.hostStartList;
            if (
                (routingTableData.maxIPList == null)
              || (ipList2Int(routingTableData.maxIPList) < ipList2Int(routingTableLine.hostEndList))
            ) routingTableData.maxIPList = routingTableLine.hostEndList;
        }
    } catch (e) {
        error(e);
        return null;
    }
    console.log(routingTableData);
    render(routingTableData);
};

var routeTableFormat = {
    linux: {
    routes: {
      0: 'destination',
      1: 'gateway',
      2: 'genmask',
      3: 'flags',
      4: 'metric',
      last: 'iface'
    }
  }
};
var translations = {
    genmask: 'mask',
  netmask: 'mask',
  iface: 'interface'
}

function parseRoutingTable(routingTableData) {
    routingTableData = routingTableData.toLowerCase();
    var routingTableList = routingTableData.split('\n');
    var section = '';
    var parsedData = {
        os: null,
        minIPList: null,
        maxIPList: null,
        routes: []
    };
    for (var i = 0; i < routingTableList.length; i++) {
        var thisLine = routingTableList[i];
        var thisLineList = thisLine.split(/[\s]+/);

        if (thisLineList[0] == '') continue; // ignore empty lines
        if (thisLine[0] == '=') continue; // ignore separators

        if (!parsedData.os == null || section == '') {
            if (thisLineList[0] == 'kernel') {
                parsedData.os = 'linux';
                section = 'routes';
            }
            else if (thisLineList[0] == 'interface' && thisLineList[1] == 'list') {
                parsedData.os = 'windows';
                section = 'interfaces';
            }
            else if (thisLineList[0] == 'ipv4' && thisLineList[1] == 'route') {
                parsedData.os = 'windows';
                section = 'interfaces';
            }
            continue;
        }

        if (
            parsedData.os == 'linux'
          && section == 'routes'
          && parsedData[section].length == 0
          && thisLineList[0] == 'destination'
        ) continue; // ignore route table header row

        var lineDict = {};
        for (var key in routeTableFormat[parsedData.os][section]) {
            var name = routeTableFormat[parsedData.os][section][key];
          var translatedName = name; // init
          if (translations.hasOwnProperty(name)) translatedName = translations[name];
          var value;
          if (parseInt(key) == key) value = thisLineList[key];
          else if (key == 'last') value = thisLineList[thisLineList.length - 1];
          switch (translatedName) {
            case 'destination':
              if (value == 'default') value = '0.0.0.0';
              break;
            case 'gateway':
              if (value == '*') value = '0.0.0.0';
              break;
          }
          lineDict[translatedName] = value;
        }
        parsedData[section].push(lineDict);
    }
    return parsedData;
}

function error(txt) {
    document.getElementById('error').innerHTML = txt;
}

// rendering

function clearSVG() {
    removeAllChildren(svg.getElementById('z0'));
  removeAllChildren(svg.getElementById('z1'));
  removeAllChildren(svg.getElementById('z2'));
  removeAllChildren(svg.getElementById('z3'));
  removeAllChildren(svg.getElementById('z4'));
  clearDestinationIPs();
}

function clearDestinationIPs() {
    var destinationIPEls = svg.getElementsByClassName('destinationIP');
  if (destinationIPEls.length > 0) {
    svg.removeChild(destinationIPEls[0]);
  }
}

function removeAllChildren(el) {
  while (el.lastChild) {
    el.removeChild(el.lastChild);
  }
}

function render(routingTableData) {
        // resize the svg height to fit the interfaces and gateways
    resizeSVGHeight(routingTableData);

        // render the areas
    renderNamedArea(svgProperties.topHalfHeight, 0, svgProperties.interfaceLeft + svgProperties.deviceSquareHeight, 'this machine');
    renderNamedArea(svgProperties.overallHeight, svgProperties.interfaceLeft + svgProperties.deviceSquareHeight - svgProperties.areaBorderWidth, svgProperties.gatewayLeft + svgProperties.deviceSquareHeight, 'LAN');
    renderNamedArea(svgProperties.overallHeight, svgProperties.gatewayLeft + svgProperties.deviceSquareHeight - svgProperties.areaBorderWidth, svgProperties.overallWidth, 'WAN');

        renderIPLimits(routingTableData);

    // get the interface coordinates
    var interfaceData = getInterfaceCoordinates(routingTableData);

    // get the gateway coordinates
    var gatewayData = getGatewayCoordinates(routingTableData);

    // render the interfaces
    renderInterfaces(interfaceData);

        // render the gateways
    renderGateways(gatewayData);

        // render the external destinations
    renderExternalDestinations(gatewayData);

    // then get the ip range coordinates
    var ipRangesData = getIPRangeCoordinates(routingTableData);
    // render the ip ranges going to the interfaces
    renderIPRanges(ipRangesData, interfaceData, gatewayData);

    // select the correct route table line
    var destinationIP = document.getElementById('destinationIP').value;
    var destinationIPList = ip2List(destinationIP);
    var routingTableDataLine = pickPath(destinationIPList, routingTableData);
    if (routingTableDataLine == null) return;

    // render the desination ip flow
    renderDestinationIPFlow(destinationIP, destinationIPList, routingTableDataLine, interfaceData, gatewayData, routingTableData);
}

function initSVGProperties() {
  var nicEl = svgDefs.querySelectorAll('.nic')[0];
  svgProperties.overallWidth = svg.getBBox().width;
}

function resizeSVGHeight(routingTableData) {
  var interfaceNames = []; // init
  var gatewayNames = []; // init
  var defaultGWFound = false;
  for (var i = 0; i < routingTableData.routes.length; i++) {
    var routeLine = routingTableData.routes[i];

    var interfaceName = routeLine.interface;
    if (interfaceNames.indexOf(interfaceName) == -1) interfaceNames.push(interfaceName);

    var gatewayName = routeLine.gateway;
    if (gatewayNames.indexOf(gatewayName) == -1) {
        if (gatewayName == '0.0.0.0') defaultGWFound = true;
        gatewayNames.push(gatewayName);
    }
  }

  var minHeightForInterfaces = (2 * svgProperties.verticalGapBeforeAndAfterInterfaces) + (interfaceNames.length * svgProperties.deviceSquareHeight) + ((interfaceNames.length - 1) * svgProperties.minVerticalGapBetweenInterfaces);

  var minHeightForGateways = (2 * svgProperties.verticalGapBeforeAndAfterGateways) + (gatewayNames.length * svgProperties.deviceSquareHeight) + ((gatewayNames.length - 1) * svgProperties.minVerticalGapBetweenGateways);

  svgProperties.topHalfHeight = minHeightForInterfaces; // init
  if (minHeightForGateways > svgProperties.topHalfHeight) svgProperties.topHalfHeight = minHeightForGateways;

  var minHeightForGatewaysAndOtherMachines = 0;
  if (defaultGWFound) minHeightForGatewaysAndOtherMachines = svgProperties.topHalfHeight - svgProperties.verticalGapBeforeAndAfterGateways + svgProperties.verticalGapAfterOtherNic + svgProperties.verticalGapBetweenOtherNicAndGateways + svgProperties.deviceSquareHeight

  svgProperties.overallHeight = svgProperties.topHalfHeight; // init
  if (minHeightForGatewaysAndOtherMachines > svgProperties.overallHeight) svgProperties.overallHeight = minHeightForGatewaysAndOtherMachines;

  svg.style.height = svgProperties.overallHeight;
  svg.setAttribute('viewBox', '0 0 800 ' + svgProperties.overallHeight);
}

function renderNamedArea(height, startX, endX, text) {
  var rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rectEl.setAttribute('x', startX + (svgProperties.areaBorderWidth / 2));
  rectEl.setAttribute('y', svgProperties.areaBorderWidth / 2);
  rectEl.setAttribute('width', endX - startX - svgProperties.areaBorderWidth);
  rectEl.setAttribute('height', height - svgProperties.areaBorderWidth);
  rectEl.setAttribute('stroke-width', svgProperties.areaBorderWidth);
  rectEl.setAttribute('class', 'namedArea');
  svg.getElementById('z0').appendChild(rectEl);

  var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textEl.textContent = text;
  textEl.setAttribute('x', startX + ((endX - startX) / 2));
  textEl.setAttribute('y', svgProperties.areaBorderWidth + 4);
  textEl.setAttribute('class', 'areaName');
  svg.getElementById('z0').appendChild(textEl);
}

function renderIPLimits(routingTableData) {
    var minIPTextEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  minIPTextEl.setAttribute('x', svgProperties.ipLeft - svgProperties.ipHorizontalMargin);
  minIPTextEl.setAttribute('y', svgProperties.topHalfHeight - svgProperties.verticalGapBeforeAndAfterIPRange - svgProperties.ipTextVerticalMargin);
  minIPTextEl.setAttribute('id', 'smallestIP');
  minIPTextEl.textContent = ipList2IP(routingTableData.minIPList);
  svg.getElementById('z1').appendChild(minIPTextEl);

  var maxIPTextEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  maxIPTextEl.setAttribute('x', svgProperties.ipLeft - svgProperties.ipHorizontalMargin);
  maxIPTextEl.setAttribute('y', svgProperties.verticalGapBeforeAndAfterIPRange + svgProperties.ipTextVerticalMargin);
  maxIPTextEl.setAttribute('id', 'largestIP');
  maxIPTextEl.textContent = ipList2IP(routingTableData.maxIPList);
  svg.getElementById('z1').appendChild(maxIPTextEl);
}

function getInterfaceCoordinates(routingTableData) {
    var interfaceNames = [];
    for (var i = 0; i < routingTableData.routes.length; i++) {
    var interfaceName = routingTableData.routes[i].interface;
    if (interfaceNames.indexOf(interfaceName) != -1) continue;
    interfaceNames.push(interfaceName);
  }
  if (interfaceNames.length == 0) return null;
  var interfaceData = []; // init
  var heightForInterfaces = svgProperties.topHalfHeight - (svgProperties.verticalGapBeforeAndAfterInterfaces * 2)
  var verticalGapBetweenInterfaces = (heightForInterfaces - (interfaceNames.length * svgProperties.deviceSquareHeight)) / (interfaceNames.length - 1);
  for (var i = 0; i < interfaceNames.length; i++) {
    var top = svgProperties.verticalGapBeforeAndAfterInterfaces + (i * (svgProperties.deviceSquareHeight + verticalGapBetweenInterfaces));
        interfaceData.push({
        name: interfaceNames[i],
        top: top,
      midway: top + (svgProperties.deviceSquareHeight / 2),
      bottom: top + svgProperties.deviceSquareHeight
    });
  }
  return interfaceData;
}

function renderInterfaces(interfaceData) {
  for (var i = 0; i < interfaceData.length; i++) {
    var nicData = interfaceData[i];
    render1Nic(svgProperties.interfaceLeft, nicData.top, nicData.name);
  }
}

function getGatewayCoordinates(routingTableData) {
  var gatewayNames = [];
  var defaultGWFound = false;
  for (var i = 0; i < routingTableData.routes.length; i++) {
    var gatewayName = routingTableData.routes[i].gateway;
    if (gatewayName == '0.0.0.0') {
        defaultGWFound = true;
      continue;
    }
    if (gatewayNames.indexOf(gatewayName) != -1) continue;
    gatewayNames.push(gatewayName);
  }
  // the default gateway must go on the end
  if (defaultGWFound) gatewayNames.push('0.0.0.0');
  if (gatewayNames.length == 0) return null;
  var gatewayData = []; // init
  var heightForGateways = svgProperties.topHalfHeight - (svgProperties.verticalGapBeforeAndAfterGateways * 2);
  var verticalGapBetweenGateways = (heightForGateways - (gatewayNames.length * svgProperties.deviceSquareHeight)) / (gatewayNames.length - 1);
  for (var i = 0; i < gatewayNames.length; i++) {
    var top = svgProperties.verticalGapBeforeAndAfterGateways + (i * (svgProperties.deviceSquareHeight + verticalGapBetweenGateways));
    gatewayData.push({
        name: gatewayNames[i],
        top: top,
      midway: top + (svgProperties.deviceSquareHeight / 2),
      bottom: top + svgProperties.deviceSquareHeight
    });
  }
  return gatewayData;
}

function renderGateways(gatewayData) {
  for (var i = 0; i < gatewayData.length; i++) {
    var gwData = gatewayData[i];
    var text = gwData.name;
    if (text == '0.0.0.0') text += '\n(default)';
    render1Gateway(svgProperties.gatewayLeft, gwData.top, text);
  }
}

function renderExternalDestinations(gatewayData) {
    for (var i = 0; i < gatewayData.length; i++) {
    var gwData = gatewayData[i];
    if (gwData.name == '0.0.0.0') { // LAN
        render1Nic(svgProperties.gatewayLeft, gwData.top + svgProperties.deviceSquareHeight + svgProperties.verticalGapBetweenOtherNicAndGateways, 'other\nmachines');
    } else { // WAN or internet
      render1Gateway(svgProperties.externalDestinationLeft, gwData.top, '');
    }
  }
}

function render1Nic(left, top, text) {
        var nicEl = svgDefs.querySelectorAll('.nic')[0].cloneNode(true);
    nicEl.getElementsByTagName('rect')[0].setAttribute('height', svgProperties.deviceSquareHeight);
    nicEl.getElementsByTagName('rect')[0].setAttribute('width', svgProperties.deviceSquareHeight);
    nicEl.setAttribute('transform', 'translate(' + left + ',' + top + ')');
    var nicTextEl = nicEl.getElementsByTagName('text')[0];
    nicTextEl.setAttribute('x', svgProperties.deviceSquareHeight / 2);
    nicTextEl.setAttribute('y', (svgProperties.deviceSquareHeight / 2));
    renderMultilineText(nicTextEl, text);
    svg.getElementById('z4').appendChild(nicEl);
}

function render1Gateway(left, top, text) {
        var gwEl = svgDefs.querySelectorAll('.gateway')[0].cloneNode(true);
    gwEl.getElementsByTagName('circle')[0].setAttribute('r', svgProperties.deviceSquareHeight / 2);
    gwEl.setAttribute('transform', 'translate(' + (left + (svgProperties.deviceSquareHeight / 2)) + ',' + (top + (svgProperties.deviceSquareHeight / 2)) + ')');
    renderMultilineText(gwEl.getElementsByTagName('text')[0], text);
    svg.getElementById('z4').appendChild(gwEl);
}

function renderMultilineText(textEl, text) {
        var textLines = text.split('\n');
    textEl.setAttribute('y', (-0.55 * (textLines.length - 1)) + 'em');
    for (var i = 0; i < textLines.length; i++) {
        var tspanEl = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspanEl.textContent = textLines[i];
      tspanEl.setAttribute('x', 0);
      if (i > 0) tspanEl.setAttribute('dy', '1.2em');
      textEl.appendChild(tspanEl);
    }
}

function getIPRangeCoordinates(routingTableData) {
  var interfaceData = []; // init
  for (var i = 0; i < routingTableData.routes.length; i++) {
    var routeTableLine = routingTableData.routes[i];
    var start = ipInt2Y(ipList2Int(routeTableLine.hostStartList), routingTableData);
    var end = ipInt2Y(ipList2Int(routeTableLine.hostEndList), routingTableData);
    interfaceData.push({
        startIP: routeTableLine.hostStartList.join('.'),
        endIP: routeTableLine.hostEndList.join('.'),
        top: end,
        bottom: start,
        interfaceName: routeTableLine.interface,
        gatewayName: routeTableLine.gateway
    });
  }
  return interfaceData;
}

function ipInt2Y(ipInt, routingTableData) {
  var maxIPInt = ipList2Int(routingTableData.maxIPList);
  var minIPInt = ipList2Int(routingTableData.minIPList);
  // given 2 points, we can find the line between them:
    var p1x = minIPInt;
  var p1y = svgProperties.topHalfHeight - svgProperties.verticalGapBeforeAndAfterIPRange;
  var p2x = maxIPInt;
  var p2y = svgProperties.verticalGapBeforeAndAfterIPRange;
  var slope = (p2y - p1y) / (p2x - p1x);
  // y1 = mx1 + c
  var intercept = p1y - (slope * p1x);
  return (slope * ipInt) + intercept;
}

function renderIPRanges(ipRangesData, interfacesData, gatewaysData) {
  var startIPTextClass = ''; // init
  var startIPTextY = 0; //init
  var endIPTextClass = ''; // init
  var endIPTextY = 0; //init
  for (var i = 0; i < ipRangesData.length; i++) {
    var ipRangeData = ipRangesData[i];
    var interfaceData = null;
    for (var j = 0; j < interfacesData.length; j++) {
      if (ipRangeData.interfaceName != interfacesData[j].name) continue;
      interfaceData = interfacesData[j]; // use this one
      break;
    }

    var gatewayData = null;
    for (var j = 0; j < gatewaysData.length; j++) {
      if (ipRangeData.gatewayName != gatewaysData[j].name) continue;
      gatewayData = gatewaysData[j]; // use this one
      break;
    }

    var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'ipRange');

    // the path from the ip range to the interface
    var startX = svgProperties.ipLeft;
    var startY = ipRangeData.bottom;
    var path = 'M' + startX + ',' + startY + ' ';

    var endX = svgProperties.interfaceLeft;
    var endY = interfaceData.bottom;
    path += getIPBezier(startX, startY, endX, endY);

        startX = endX;
    startY = interfaceData.top;
    path += 'V' + startY + ' ';

    endX = svgProperties.ipLeft;
    endY = ipRangeData.top;
    path += getIPBezier(startX, startY, endX, endY) + 'Z';
    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', svgProperties.ipColors[i % svgProperties.ipColors.length]);
    pathEl.setAttribute('class', 'ipRange');
    group.appendChild(pathEl);
        svg.getElementById('z1').appendChild(pathEl.cloneNode(true));

        // the path from the interface to the gateway
        startX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
    startY = interfaceData.top;
    path = 'M' + startX + ',' + startY + ' '; // new path

    endX = svgProperties.gatewayLeft + (svgProperties.deviceSquareHeight / 2);
    endY = gatewayData.top;
    path += getIPBezier(startX, startY, endX, endY);

    endY = gatewayData.bottom;
    path += 'V' + endY;

    startX = endX;
    startY = endY;
    endX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
    endY = interfaceData.bottom;
    path += getIPBezier(startX, startY, endX, endY) + 'Z';
    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', svgProperties.ipColors[i % svgProperties.ipColors.length]);
    pathEl.setAttribute('class', 'ipRange');
    group.appendChild(pathEl);
        svg.getElementById('z1').appendChild(pathEl.cloneNode(true));

    // the path from the gateway to the foreign gateway
    if (gatewayData.name == '0.0.0.0') {
        startX = svgProperties.gatewayLeft;
      startY = gatewayData.top + (svgProperties.deviceSquareHeight / 2);
      path = 'M' + startX + ',' + startY + ' '; // new path

      endY = gatewayData.bottom + svgProperties.verticalGapBetweenOtherNicAndGateways;
      path += 'V' + endY;

            endX = svgProperties.gatewayLeft + svgProperties.deviceSquareHeight;
      path += 'H' + endX;

      endY = startY;
      path += 'V' + endY + 'Z';
    } else {
      startX = svgProperties.gatewayLeft + (svgProperties.deviceSquareHeight / 2);
      startY = gatewayData.top;
      path = 'M' + startX + ',' + startY + ' '; // new path

      endX = svgProperties.overallWidth;
      path += 'H' + endX;

      endY = gatewayData.bottom;
      path += 'V' + endY;

      endX = startX;
      path += 'H' + endX + 'Z';
    }

    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', svgProperties.ipColors[i % svgProperties.ipColors.length]);
    pathEl.setAttribute('class', 'ipRange');
    group.appendChild(pathEl);
        svg.getElementById('z1').appendChild(pathEl.cloneNode(true));

    var startIPtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    startIPtext.setAttribute('x', svgProperties.ipLeft + svgProperties.ipHorizontalMargin);
    //debugger;
    var startIPNearEndIP = (ipRangeData.bottom - ipRangeData.top) <= ((2 * svgProperties.fontSize) + svgProperties.ipTextVerticalMargin);
    var startIPNearBottom = (svgProperties.topHalfHeight - svgProperties.verticalGapBeforeAndAfterIPRange - ipRangeData.bottom) < svgProperties.fontSize;
    var endIPNearBottom = (svgProperties.topHalfHeight - svgProperties.verticalGapBeforeAndAfterIPRange - ipRangeData.top) < svgProperties.fontSize;
    var startIPNearTop = (ipRangeData.bottom - svgProperties.verticalGapBeforeAndAfterIPRange) < svgProperties.fontSize;
        var endIPNearTop = (ipRangeData.top - svgProperties.verticalGapBeforeAndAfterIPRange) < svgProperties.fontSize;
    startIPTextY = ipRangeData.bottom;
        if (startIPNearEndIP && !startIPNearBottom) {
        startIPTextClass = 'startIP-near-endIP';
      startIPTextY += svgProperties.ipTextVerticalMargin;
      if (endIPNearTop) startIPTextY = ipRangeData.top + svgProperties.fontSize + (2 * svgProperties.ipTextVerticalMargin);
    } else {
            startIPTextY -= svgProperties.ipTextVerticalMargin;
        startIPTextClass = 'startIP';
    }
    startIPtext.setAttribute('y', startIPTextY);
    startIPtext.textContent = ipRangeData.startIP;
    startIPtext.setAttribute('class', startIPTextClass);
    group.appendChild(startIPtext);

    var endIPtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    endIPtext.setAttribute('x', svgProperties.ipLeft + svgProperties.ipHorizontalMargin);
    endIPTextY = ipRangeData.top;
    if (startIPNearEndIP && !endIPNearTop) {
      endIPTextClass = 'endIP-near-startIP';
      endIPTextY -= svgProperties.ipTextVerticalMargin;
      if (startIPNearBottom) endIPTextY = ipRangeData.bottom - svgProperties.fontSize - (2 * svgProperties.ipTextVerticalMargin);
    } else {
        endIPTextY += svgProperties.ipTextVerticalMargin;
        endIPTextClass = 'endIP';
    }
    endIPtext.setAttribute('y', endIPTextY);
    endIPtext.textContent = ipRangeData.endIP;
    endIPtext.setAttribute('class', endIPTextClass);
    group.appendChild(endIPtext);

    svg.getElementById('z2').appendChild(group);
    group.onclick = z2GroupPathClicked;
  }
}

// given a destination ip (list), choose the line from the routing table that
// applies to it. if there is more than one line then set an error and return
// null
function pickPath(destinationIPList, routingTableData) {
    // first find all route table lines that apply
    var applicableRouteLines = []; // init
    var largestNetmaskBits = 0; // init (largest = 32 = the most specific)
    for (var i = 0; i < routingTableData.routes.length; i++) {
        var routingTableDataLine = routingTableData.routes[i];
        var inRange = true; // start optimistic
        for (var j = 0; j < destinationIPList.length; j++) {
            if (
                (destinationIPList[j] < routingTableDataLine.hostStartList[j])
                || (destinationIPList[j] > routingTableDataLine.hostEndList[j])
            ) {
                inRange = false;
                break;
            }
        }
        if (!inRange) continue;
        var netmaskBits = mask2Bits(routingTableDataLine.mask);
        applicableRouteLines.push({
            line: i,
          netmaskBits: netmaskBits
        });
        if (netmaskBits > largestNetmaskBits) largestNetmaskBits = netmaskBits;
    }

    // then only keep the largest netmask item(s)
    var keep = []; // init
    for (var i = 0; i < applicableRouteLines.length; i++) {
        var applicableRouteData = applicableRouteLines[i];
      if (applicableRouteData.netmaskBits < largestNetmaskBits) continue;
      keep.push(applicableRouteData.line);
    }

    if (keep.length == 0) {
        error('no route rules apply to this destination ip');
        return null;
    }
    if (keep.length > 1) {
        error('more than 1 route rule applies to this destination ip');
        return null;
    }
    return routingTableData.routes[keep[0]];
}

function renderDestinationIPFlow(destinationIP, destinationIPList, routeTableLine, interfaceData, gatewayData, routingTableData) {
    var destinationIPInt = ipList2Int(destinationIPList);

    var startX = svgProperties.ipLeft;
    var startY = ipInt2Y(destinationIPInt, routingTableData);
    var path = 'M' + startX + ',' + startY + ' ';

    var relevantInterface = null;
    for (var i = 0; i < interfaceData.length; i++) {
        if (interfaceData[i].name != routeTableLine.interface) continue;
        relevantInterface = interfaceData[i];
        break;
    }
    var endY = relevantInterface.midway;
    var endX = svgProperties.interfaceLeft;
    path += getIPBezier(startX, startY, endX, endY);

    var destinationIPtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    destinationIPtext.setAttribute('x', svgProperties.ipLeft - 2);
    destinationIPtext.setAttribute('y', startY);
    destinationIPtext.textContent = destinationIP;
    destinationIPtext.setAttribute('class', 'destinationIP');
    svg.appendChild(destinationIPtext);

    startX = svgProperties.interfaceLeft + svgProperties.deviceSquareHeight;
    startY = endY;
    path += 'H' + startX;

    var relevantGateway = null;
    for (var i = 0; i < gatewayData.length; i++) {
        if (gatewayData[i].name != routeTableLine.gateway) continue;
        relevantGateway = gatewayData[i];
        break;
    }
    endY = relevantGateway.midway;
    endX = svgProperties.gatewayLeft + (svgProperties.deviceSquareHeight / 2);
    var angledEnd = true;
    path += getIPBezier(startX, startY, endX, endY, angledEnd);
    if (relevantGateway.name == '0.0.0.0') {
        path += 'V' + (svgProperties.overallHeight - svgProperties.verticalGapAfterOtherNic - svgProperties.deviceSquareHeight);
    } else {
        path += 'H' + svgProperties.externalDestinationLeft;
    }

    pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('class', 'destinationIPFlow');
    svg.getElementById('z3').appendChild(pathEl);
}

function getIPBezier(startX, startY, endX, endY, angledEnd) {
  // svg beziers look like this:
  // M start-x,start-y C control-x1 control-y1, control-x2 control-y2, end-x end-y
  // the start position must be set-up outside this function
  if (angledEnd == null) angledEnd = false;
  var controlSize = (endX - startX) / 2;
  var controlX1 = startX + controlSize;
  var controlY1 = startY;
  var controlX2, controlY2; // init
  if (angledEnd) {
    controlX2 = startX;
    controlY2 = startY;
  } else {
    controlX2 = endX - controlSize;
    controlY2 = endY;
  }
  return 'C ' + controlX1 + ' ' + controlY1 + ',' + controlX2 + ' ' +
  controlY2 + ',' + endX + ' ' + endY + ' ';
}
