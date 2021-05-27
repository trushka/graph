var dataURL = "https://trushko.000webhostapp.com/graph_json/data.json";

var forceCharge = -50, 
    container=document.querySelector('#container'),
  linkDistance = 30,
  width = container.offsetWidth,
  height = container.offsetHeight;
console.log(container, width, height);

var tooltip = d3.select("#tooltip").style("opacity", 0);

d3.json(dataURL).then(data=> {
  console.log(data)
  let nodes=[], links=[], links0=[];
  
  data.forEach(item=>{
    let link = {
      source: nodes.findIndex(el=>item.applicant==el.name),
      target: nodes.findIndex(el=>item['Listing Agent']==el.name)
    }
    if (link.source<0) {
      link.source=nodes.length;
      nodes.push({
        name: item.applicant,
        type: 'applicant',
        x: width/2,
        y: height/2
      })
    }    
    if (link.target<0) {
      link.target=nodes.length;
      nodes.push({
        name: item['Listing Agent'],
        type: 'l-agent', 
        //x: width*(0.3+Math.random()*.4),
        //y: height*(0.3+Math.random()*.4)
      })
    }
    //console.log(link);
    links.push(link);
  }); 
  //console.log(nodes);
  //console.log( links);
  var canvas = d3.select("#charts")
    .attr("width", width)
    .attr("height", height);
//console.log(canvas)
  var force = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).distance(40))//.strength(.1))
    .force('charge',d3.forceManyBody().strength(-75))
    .force('center',d3.forceCenter(width/2, height/2).strength(0))
    .force('x',d3.forceX(width/2).strength(.2))
    .force('y',d3.forceY(height/2).strength(.2))
    //.force('x1',d3.forceX(width).strength(.0421))
    //.force('y1',d3.forceY(height).strength(.0421))
  .alphaDecay(0);  

  var ctx=canvas.node().getContext('2d'); 
    // lines = d3.select("#charts").selectAll(".link")
    // .data(links)
    // .enter().append("div")
    // .attr("class", "link");

  var flags = d3.select('#flags').selectAll("img")
    .data(nodes)
    .enter().append("img")
    .attr("class", function(d) {
      return 'flag ' + d.type;
    })
    .on('mouseover', function(e, d) {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0.8);
      var tooltipHtml = "<span>" + d.name + "</span>";
      tooltip.html(tooltipHtml)
        .style("left", (e.pageX + 5) + "px")
        .style("top", (e.pageY - 50) + "px");
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    })
    .call(d3.drag()
         .on("drag", (event, d) => (d.x = event.x, d.y = event.y)));
  
  function round(d0, d) {
    let targ = Math.round(d);
    return d0+(targ-d0)*.2
  }

  force.on("tick", function() {
    flags.style("transform", d=> `
      translate(${d.x1=round(d.x1||d.x, d.x)}px, ${d.y1=round(d.y1||d.y, d.y)}px)`);
      
    ctx.clearRect(0,0,width,height);
      ctx.strokeStyle='#9999';
    
    links.forEach(d=>{
      let {x1: x0, y1: y0}=d.source,
          {x1, y1}=d.target;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
    })
      ctx.stroke()
    // lines.style("transform", d=> {
    //       dx=x1-x0, dy=y1-y0,
    //       scale=Math.sqrt(dx*dx+dy*dy)/100,
    //       angle=Math.atan(dy/dx)-(dx>0&&Math.PI);
     // debugger;
    //   return `translate(${x1}px, ${y1}px)
    //   rotate(${angle}rad) scaleX(${scale})`
    // });

  });
});