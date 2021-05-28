
var tooltip = d3.select("#tooltip").style("opacity", 0);

d3.json("https://trushko.000webhostapp.com/graph_json/data.json").then(data=> {
  //console.log(data)
  const duration=170000, delay=2000,

     nodes=[], links=[], links0=[],
      container=document.querySelector('#container');

  let t0=Date.now(), t1=0,
    width = container.offsetWidth,
    height = container.offsetHeight;
  
  data.forEach(item=>{
    let link = {
      source: nodes.find(el=>item.applicant==el.name),
      target: nodes.find(el=>item['Listing Agent']==el.name),
      date: new Date(item['Listing Date'])
    }
    t0=Math.min(t0, +link.date);
    t1=Math.max(t1, +link.date);

    if (!link.source) {
      nodes.push(link.source={
        name: item.applicant,
        type: 'applicant',
        x: width*(0.4+Math.random()*.2),
        y: height*(0.4+Math.random()*.2)
      })
    }    
    if (!link.target) {
      nodes.push(link.target={
        name: item['Listing Agent'],
        type: 'l-agent', 
        x: width*(0.4+Math.random()*.2),
        y: height*(0.4+Math.random()*.2)
      })
    }
    //console.log(link);
    links.push(link);
  }); 
  //console.log(nodes);
  //console.log( links);
  const dt=(t1-t0)/duration;
  console.log(t0,t1)
  d3.timer(t=>{
    t=t0+dt*t;
    links.some(d=>{
      if (d.strength || +d.date>t) return false;
      //console.log(t);
      
      return (d.strength=.15) && force.force('link').links(links).strength(d=>d.strength||.01);
    })
  }, delay)

 var force = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).distance(45))//.strength(.1))
    .force('charge',d3.forceManyBody().strength(3))
    .force('collide',d3.forceCollide(60).strength(.15))
    .force('collide1',d3.forceCollide(40).strength(.23))
    .force('center',d3.forceCenter(width/2, height/2).strength(.5))
    // .force('x',d3.forceX(width/2).strength(0))//.1))
    // .force('y',d3.forceY(height/2).strength(0))//.15))
    //.force('x1',d3.forceX(width).strength(.0421))
    //.force('y1',d3.forceY(height).strength(.0421))
  .alphaDecay(0);  

  var lines = d3.select("#charts").selectAll(".link")
    .data(links)
    .enter().append("div")
    .attr("class", "link");

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
    let offset=flags.nodes()[0].offsetWidth*3,
     bottom=height-offset, right=width-offset;
    flags.style("transform", function(d) {
      d.vx+=Math.max(0, offset-d.x)*.2;
      d.vy+=Math.max(0, offset-d.y)*.2;
      d.vx+=Math.min(0, right-d.x)*.2;
      d.vy+=Math.min(0, bottom-d.y)*.2;
      return `translate(${d.x1=round(d.x1||d.x, d.x)}px, ${d.y1=round(d.y1||d.y, d.y)}px)`
    });
      
    // ctx.clearRect(0,0,width,height);
    //   ctx.strokeStyle='#9999';
    
    // links.forEach(d=>{
    //   ctx.moveTo(x0, y0);
    //   ctx.lineTo(x1, y1);
    // })
    //   ctx.stroke()
    lines.style("transform", d=> {
      let {x1: x0, y1: y0}=d.source,
          {x1, y1}=d.target;
          dx=x1-x0, dy=y1-y0,
          scale=Math.sqrt(dx*dx+dy*dy)/100,
          angle=Math.atan(dy/dx)-(dx>0&&Math.PI);
      //debugger;
      return `translate(${x1}px, ${y1}px)
      rotateZ(${angle}rad) scaleX(${scale})`
    }).style('opacity', d=>+!!d.strength);

  });
});