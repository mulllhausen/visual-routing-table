// static properties
var svg = document.getElementById('routeTable');
var svgDefs = svg.getElementsByTagName('defs')[0];
var svgProperties = {
    overallHeight: 400, // gets updated to match the svg
    overallWidth: 400, // gets updated to match the svg
    borders: 1,

    ipLeft: 110, // the left position of the ip ranges
    ipColors: [
        'blue'//,'green', 'red', 'purple'
    ],

        interfaceSquareSide: 100, // interfaces are squares and this is the length of one side
    interfaceLeft: 260, // the left position of the interfaces
    minVerticalGapBetweenInterfaces: 10,
    verticalGapBeforeAndAfterInterfaces: 30, // the gap before interfaces, repeated at the bottom too

    gatewayLeft: 450, // the left position of the gateways
    gatewayRadius: 50, // gateways are circles and this is the radius
    minVerticalGapBetweenGateways: 10,
    verticalGapBeforeAndAfterGateways: 30, // the gap before gateways, repeated at the bottom too
};

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
  for (var i = 0; i < ipList.length; i++) {
    ipList[i] = ipList[i].toString(ipVersion == 4 ? 10 : 16);
  }
  return ipList.join(delimiter);
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
            else if (thisLineList[0] == 'interface' && thisLineList[1] == 'last') {
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
            if (parseInt(key) == key) lineDict[translatedName] = thisLineList[key];
          else if (key == 'last') lineDict[translatedName] = thisLineList[thisLineList.length - 1];
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
    removeAllChildren(svg.getElementById('z1'));
  removeAllChildren(svg.getElementById('z2'));
  removeAllChildren(svg.getElementById('z3'));
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

    // get the interface coordinates
    var interfaceData = getInterfaceCoordinates(routingTableData);

    // get the gateway coordinates
    var gatewayData = getGatewayCoordinates(routingTableData);

    // render the interfaces
    renderInterfaces(interfaceData);

        // render the gateways
    renderGateways(gatewayData);

    // then get the ip range coordinates
    var ipRangesData = getIPRangeCoordinates(routingTableData);
    // render the ip ranges going to the interfaces
    renderIPRanges(ipRangesData, interfaceData, gatewayData);

    // get the applicable route table line
    var destinationIP = document.getElementById('destinationIP').value;
    var destinationIPList = ip2List(destinationIP);
    var routingTableDataLine = pickPath(destinationIPList, routingTableData);
    if (routingTableDataLine == null) return;

    // render the desination ip flow
    renderDestinationIPFlow(destinationIP, destinationIPList, routingTableDataLine, interfaceData, gatewayData);
}

function initSVGProperties() {
  var nicEl = svgDefs.querySelectorAll('.nic')[0];
  svgProperties.overallHeight = svg.getBBox().height;
  svgProperties.overallWidth = svg.getBBox().width;
}

function resizeSVGHeight(routingTableData) {
  var interfaceNames = []; // init
  var gatewayNames = []; // init
  for (var i = 0; i < routingTableData.routes.length; i++) {
    var routeLine = routingTableData.routes[i];

    var interfaceName = routeLine.interface;
    if (interfaceNames.indexOf(interfaceName) == -1) interfaceNames.push(interfaceName);

    var gatewayName = routeLine.gateway;
    if (gatewayNames.indexOf(gatewayName) == -1) gatewayNames.push(gatewayName);
  }

  var minHeightForInterfaces = (2 * svgProperties.verticalGapBeforeAndAfterInterfaces) + (interfaceNames.length * svgProperties.interfaceSquareSide) + ((interfaceNames.length - 1) * svgProperties.minVerticalGapBetweenInterfaces);

  var minHeightForGateways = (2 * svgProperties.verticalGapBeforeAndAfterGateways) + (gatewayNames.length * 2 * svgProperties.gatewayRadius) + ((gatewayNames.length - 1) * svgProperties.minVerticalGapBetweenGateways);

  svgProperties.overallHeight = minHeightForInterfaces; // init
  if (minHeightForGateways > svgProperties.overallHeight) svgProperties.overallHeight = minHeightForGateways;
  svg.style.height = svgProperties.overallHeight;
  svg.setAttribute('viewBox', '0 0 800 ' + svgProperties.overallHeight);
  svg.getElementsByClassName('smallestIP')[0].setAttribute('y', svgProperties.overallHeight - 5);
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
  var heightForInterfaces = svgProperties.overallHeight - (svgProperties.verticalGapBeforeAndAfterInterfaces * 2)
  var verticalGapBetweenInterfaces = (heightForInterfaces - (interfaceNames.length * svgProperties.interfaceSquareSide)) / (interfaceNames.length - 1);
  for (var i = 0; i < interfaceNames.length; i++) {
    var top = svgProperties.verticalGapBeforeAndAfterInterfaces + (i * (svgProperties.interfaceSquareSide + verticalGapBetweenInterfaces));
        interfaceData.push({
        name: interfaceNames[i],
        top: top,
      midway: top + (svgProperties.interfaceSquareSide / 2),
      height: svgProperties.interfaceSquareSide,
      bottom: top + svgProperties.interfaceSquareSide
    });
  }
  return interfaceData;
}

function renderInterfaces(interfaceData) {
  for (var i = 0; i < interfaceData.length; i++) {
    var nicData = interfaceData[i];
    var nicEl = svgDefs.querySelectorAll('.nic')[0].cloneNode(true);
    nicEl.getElementsByTagName('rect')[0].setAttribute('height', nicData.height);
    nicEl.getElementsByTagName('rect')[0].setAttribute('width', svgProperties.interfaceSquareSide);
    nicEl.setAttribute('transform', 'translate(' + svgProperties.interfaceLeft + ',' + nicData.top + ')');
    nicEl.getElementsByTagName('text')[0].textContent = nicData.name;
    nicEl.getElementsByTagName('text')[0].setAttribute('x', svgProperties.interfaceSquareSide / 2);
    nicEl.getElementsByTagName('text')[0].setAttribute('y', (nicData.height / 2));
    svg.getElementById('z1').appendChild(nicEl);
  }
}

function getGatewayCoordinates(routingTableData) {
    var gatewayNames = [];
    for (var i = 0; i < routingTableData.routes.length; i++) {
    var gatewayName = routingTableData.routes[i].gateway;
    if (gatewayNames.indexOf(gatewayName) != -1) continue;
    gatewayNames.push(gatewayName);
  }
  if (gatewayNames.length == 0) return null;
  var gatewayData = []; // init
  var heightForGateways = svgProperties.overallHeight - (svgProperties.verticalGapBeforeAndAfterGateways * 2);
  var verticalGapBetweenGateways = (heightForGateways - (gatewayNames.length * svgProperties.gatewayRadius * 2)) / (gatewayNames.length - 1);
  for (var i = 0; i < gatewayNames.length; i++) {
    var top = svgProperties.verticalGapBeforeAndAfterGateways + (i * ((svgProperties.gatewayRadius * 2) + verticalGapBetweenGateways));
        gatewayData.push({
        name: gatewayNames[i],
        top: top,
      midway: top + svgProperties.gatewayRadius,
      height: (svgProperties.gatewayRadius * 2),
      bottom: top + (svgProperties.gatewayRadius * 2)
    });
  }
  return gatewayData;
}

function renderGateways(gatewayData) {
  for (var i = 0; i < gatewayData.length; i++) {
    var gwData = gatewayData[i];
    var gwEl = svgDefs.querySelectorAll('.gateway')[0].cloneNode(true);
    gwEl.getElementsByTagName('circle')[0].setAttribute('r', svgProperties.gatewayRadius);
    gwEl.setAttribute('transform', 'translate(' + (svgProperties.gatewayLeft + svgProperties.gatewayRadius) + ',' + (gwData.top + svgProperties.gatewayRadius) + ')');
    gwEl.getElementsByTagName('text')[0].textContent = gwData.name;
    gwEl.getElementsByTagName('text')[0].setAttribute('x', 0);
    gwEl.getElementsByTagName('text')[0].setAttribute('y', 0);
    svg.getElementById('z4').appendChild(gwEl);
  }
}

function getIPRangeCoordinates(routingTableData) {
  var interfaceData = []; // init
  for (var i = 0; i < routingTableData.routes.length; i++) {
    var routeTableLine = routingTableData.routes[i];
    var start = ipInt2Y(ipList2Int(routeTableLine.hostStartList));
    var end = ipInt2Y(ipList2Int(routeTableLine.hostEndList));
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

function ipInt2Y(ipInt) {
    return svgProperties.overallHeight * (1 - (ipInt / 0xffffffff));
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
        startX = svgProperties.interfaceLeft + svgProperties.interfaceSquareSide;
    startY = interfaceData.top;
    var path = 'M' + startX + ',' + startY + ' '; // new path

    var endX = svgProperties.gatewayLeft + svgProperties.gatewayRadius;
    var endY = gatewayData.top;
    path += getIPBezier(startX, startY, endX, endY);

    endY = gatewayData.bottom;
    var arcRotation = 180; // +/- doesn't matter
    var largeArcFlag = 0; // can be anything
    var sweepFlag = 0; // 0 = keep left
    path += 'A ' + svgProperties.gatewayRadius + ',' + svgProperties.gatewayRadius + ' ' + arcRotation + ' ' + largeArcFlag + ' ' + sweepFlag + ' ' + endX + ',' + endY;

    startX = endX;
    startY = endY;
    endX = svgProperties.interfaceLeft + svgProperties.interfaceSquareSide;
    endY = interfaceData.bottom;
    path += getIPBezier(startX, startY, endX, endY) + 'Z';
    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', svgProperties.ipColors[i % svgProperties.ipColors.length]);
    pathEl.setAttribute('class', 'ipRange');
    group.appendChild(pathEl);
        svg.getElementById('z1').appendChild(pathEl.cloneNode(true));

    var startIPtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    startIPtext.setAttribute('x', svgProperties.ipLeft + 2);
    startIPTextY = ipRangeData.bottom;
    if ((svgProperties.overallHeight - ipRangeData.bottom) < 12) {
      startIPTextY -= 5;
      startIPTextClass = 'startIP-near-bottom';
    } else {
        startIPTextY += 12;
        startIPTextClass = 'startIP';
    }
    startIPtext.setAttribute('y', startIPTextY);
    startIPtext.textContent = ipRangeData.startIP;
    startIPtext.setAttribute('class', startIPTextClass);
    group.appendChild(startIPtext);

    var endIPtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    endIPtext.setAttribute('x', svgProperties.ipLeft + 2);
    endIPTextY = ipRangeData.top;
    if (ipRangeData.top < 12) {
      endIPTextY += 5;
      endIPTextClass = 'endIP-near-top';
    } else {
        endIPTextY -= 12;
        startIPTextClass = 'endIP';
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

function renderDestinationIPFlow(destinationIP, destinationIPList, routeTableLine, interfaceData, gatewayData) {
    var destinationIPInt = ipList2Int(destinationIPList);

    var startX = svgProperties.ipLeft;
    var startY = ipInt2Y(destinationIPInt);
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

    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('class', 'destinationIPFlow');
    svg.getElementById('z3').appendChild(pathEl);

    var destinationIPtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    destinationIPtext.setAttribute('x', svgProperties.ipLeft - 2);
    if (startY < 23) startY = 23;
    else if (startY > (svgProperties.overallHeight - 23)) startY = svgProperties.overallHeight - 23;
    destinationIPtext.setAttribute('y', startY);
    destinationIPtext.textContent = destinationIP;
    destinationIPtext.setAttribute('class', 'destinationIP');
    svg.appendChild(destinationIPtext);

    startX = svgProperties.interfaceLeft + svgProperties.interfaceSquareSide;
    startY = endY;
    path = 'M' + startX + ',' + startY + ' ';

    var relevantGateway = null;
    for (var i = 0; i < gatewayData.length; i++) {
        if (gatewayData[i].name != routeTableLine.gateway) continue;
        relevantGateway = gatewayData[i];
        break;
    }
    endY = relevantGateway.midway;
    endX = svgProperties.gatewayLeft + svgProperties.gatewayRadius;
    var angledEnd = true;
    path += getIPBezier(startX, startY, endX, endY, angledEnd);

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
