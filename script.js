var app = new Vue({
    el: '#app',
    data: {
        input: '',
        hospitalNumbers: '',
        hospitalNodes: [],
        driverNode: '',
        numberOfNodes: '',
        numberOfEdges: '',
        edges: [],
        currentNode: '',
        neighborsOfCurrentNode: [],
        nodesMinLength: [],
        visited: [],
        hospitalsShortestEdges: [],
        nearestHospital: '',
        startTime: '',
        endTime: '',
    },
    methods: {
        normalize() {
            var splitted = this.input.split('\n')

            this.hospitalNumbers = splitted[0]
            this.hospitalNodes = splitted[1]
            this.driverNode = splitted[2]
            this.numberOfNodes = splitted[3]
            this.numberOfEdges = splitted[4]
            
            for (let i = 5; i < splitted.length; i++) {
                var temp = []
                var temp2 = {}
                temp = splitted[i].split(' ')
                temp2['from'] = temp[0]
                temp2['to'] = temp[1]
                temp2['weight'] = temp[2]
                this.edges.push(temp2)
            }

            this.hospitalNodes = this.hospitalNodes.split(' ')

            for (let i = 0; i < this.numberOfNodes; i++) {
                var temp = {}
                if(i != this.driverNode)
                    temp['minLength'] = Infinity
                else 
                    temp['minLength'] = 0
                temp['minPath'] = ''
                this.nodesMinLength.push(temp)
            }

            this.currentNode = this.driverNode
            this.nodesMinLength[this.currentNode].minPath = this.currentNode
            this.start()
        },
        start() {
            this.startTime = performance.now();
            if(this.currentNode != null) {
                this.findNeighboursForCurrentNode()
                this.findMinLengthForNeighbors()
                this.visited.push(parseInt(this.currentNode))
                this.changeCurrentNode()
            } else {
                this.findNearestHospital()
                this.normalizeHospitalEdges()
                this.setMainGraph();
                this.setResultGraph();
            }
        },
        findNeighboursForCurrentNode() {
            this.edges.forEach(element => {
                if(element.from == this.currentNode) {
                    this.neighborsOfCurrentNode.push(element.to)
                }
            });
        },
        findMinLengthForNeighbors() {
            this.neighborsOfCurrentNode.forEach(element => {
                edgePath = null
                var edgeWeight = Infinity
                this.edges.forEach(edge => {
                    if((edge.to == element) && ((parseInt(edge.weight) + parseInt(this.nodesMinLength[edge.from].minLength)) < edgeWeight)) {
                        edgeWeight = parseInt(edge.weight) + parseInt(this.nodesMinLength[edge.from].minLength)
                        edgePath = this.nodesMinLength[edge.from].minPath
                    }   
                });              
                this.nodesMinLength[element].minLength = edgeWeight
                this.nodesMinLength[element].minPath = edgePath + ',' + element
            });
            
            //convert edge path to array of nodes
            this.nodesMinLength.forEach(element => {
                element.minPathArray = element.minPath.split(',')
            });
        },
        changeCurrentNode() {
            var temp = Infinity
            var onCommingNode = null
            this.nodesMinLength.forEach((element, index) => {
                if( !this.visited.includes((index)) ) {
                    if(element.minLength < temp) {
                        onCommingNode = index
                        temp = element.minLength
                    }
                }
            });
            this.currentNode = onCommingNode
            this.start()
        },
        findNearestHospital() {
            var tempDistanceOfNearestHospital = Infinity
            var tempNearestHospital = null
            this.hospitalNodes.forEach(hospital => {
                if(this.nodesMinLength[hospital].minLength < tempDistanceOfNearestHospital) {
                    tempDistanceOfNearestHospital = this.nodesMinLength[hospital].minLength
                    tempNearestHospital = hospital
                }
            })
            this.nearestHospital = tempNearestHospital
        },
        normalizeHospitalEdges() {
            var tempHospitalsShortestEdges = []
            this.nodesMinLength.forEach(element => {
                var splittedPaths = element.minPath.split(',')
                
                if( splittedPaths.length > 1) {
                    for (let index = 0; index < splittedPaths.length-1; index++) {
                        var oncommingPath = splittedPaths[index] + ',' + splittedPaths[index+1]
                        if(!tempHospitalsShortestEdges.includes(oncommingPath))
                            tempHospitalsShortestEdges.push(splittedPaths[index] + ',' + splittedPaths[index+1])
                    }
                }
            })
            tempHospitalsShortestEdges.forEach(element => {
                var temp = element.split(',')
                this.hospitalsShortestEdges.push(temp)
            });
        },
        setMainGraph() {
            var rawNodes = []
            for (let index = 0; index < this.numberOfNodes; index++) {
                var tempNode = {}
                tempNode['id'] = index
                tempNode['label'] = 'node ' + index
                rawNodes.push(tempNode)
            }
            var nodes = new vis.DataSet(rawNodes);

            var rawEdges = []
            for (let index = 0; index < this.edges.length; index++) {
                var tempEdge = {}
                tempEdge['from'] = this.edges[index].from
                tempEdge['to'] = this.edges[index].to
                tempEdge['label'] = this.edges[index].weight
                tempEdge['arrows'] = 'to'
                rawEdges.push(tempEdge)
            }
            var edges = new vis.DataSet(rawEdges);
                            
            var container = document.getElementById('mainGraph');
            var data = {
                nodes: nodes,
                edges: edges,
            };
            var options = {};
            
            //Init network
            var network = new vis.Network(container, data, options);
        },
        setResultGraph() {
            var rawNodes = []
            for (let index = 0; index < this.numberOfNodes; index++) {
                var tempNode = {}
                tempNode['id'] = index
                tempNode['label'] = 'node ' + index
                if(this.hospitalNodes.includes(index.toString()))
                    tempNode['color'] = '#ffff00'
                if(this.nearestHospital == index.toString())
                    tempNode['color'] = '#ff0000'
                rawNodes.push(tempNode)
            }
            var nodes = new vis.DataSet(rawNodes);

            var rawEdges = []
            for (let index = 0; index < this.hospitalsShortestEdges.length; index++) {
                var tempEdge = {}
                tempEdge['from'] = this.hospitalsShortestEdges[index][0]
                tempEdge['to'] = this.hospitalsShortestEdges[index][1]
                tempEdge['arrows'] = 'to'
                rawEdges.push(tempEdge)
            }
            var edges = new vis.DataSet(rawEdges);
                            
            var container = document.getElementById('resultGraph')
            var data = {
                nodes: nodes,
                edges: edges,
            };
            var options = {}
            
            //Init network
            var network = new vis.Network(container, data, options)
        }
    }
})