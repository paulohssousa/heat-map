import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const json = await d3.json(apiUrl);

const dataset = json.monthlyVariance;

const baseTemperature = json.baseTemperature;

const width = 1600;
const height = 460;
const marginLeft = 80;
const marginBottom = 20;
const marginRight = 30;
const marginTop = 60;
const legendWidth = (width - marginLeft - marginRight)/3;

const parseYear = d3.timeParse("%Y");
const parseMonth = d3.timeParse("%m");
const formatTime = d3.timeFormat("%B");

const firstYear = d3.min(dataset, d => d.year);
const lastYear = d3.max(dataset, d => d.year)
const minX = parseYear(firstYear);
const maxX = parseYear(lastYear);

const minY = parseMonth(1); //jan
const maxY = parseMonth(12); //dec

const barWidth = width/(lastYear - firstYear);
const barHeight = (height - marginTop - marginBottom)/11 + 1;

const colorsArray = d3.schemeRdYlBu[11];
const colors = colorsArray.reverse();
const temperatureMin = Number((d3.min(dataset, d => d.variance) + baseTemperature).toFixed(1))
const temperatureMax = Number((d3.max(dataset, d => d.variance) + baseTemperature).toFixed(1))
const step = ((temperatureMax - temperatureMin)/11)
const tickValues = d3.range(temperatureMin, temperatureMax + step, step);

const legendColor = d3.scaleQuantize([temperatureMin, temperatureMax], colors)

const xScale = d3.scaleTime()
                 .domain([minX, maxX])
                 .range([marginLeft, width - marginRight]);

const yScale = d3.scaleTime()
                 .domain([minY, maxY])
                 .range([marginTop, height - marginBottom])

const legendScale = d3.scaleLinear()
                      .domain([temperatureMin, temperatureMax])
                      .range([marginLeft, legendWidth])

const svg = d3.create("svg")
              .attr("viewBox", `0 0 ${width} ${height + 100}`)
              .attr("preserveAspectRatio", "xMinYMin meet");

const xAxis = d3.axisBottom(xScale)
                .ticks(20)
                .tickSize(10)

const yAxis = d3.axisLeft(yScale)
                .ticks(11, formatTime)
                .tickSize(10)

const temperatureAxis = d3.axisBottom(legendScale)
                          .tickValues(tickValues)
                          .tickFormat(d3.format('.1f'))
                          
//title
d3.select("#graph")
   .append("h1")
   .attr("id", "title")
   .text("Monthly Global Land-Surface Temperature")

//description
d3.select("#graph")
  .append("h2")
  .attr("id", "description")
  .text(`1753 - 2015: base temperature ${baseTemperature}°C`)

//x-axis
svg.append("g")
   .attr("transform", `translate(${barWidth/2}, ${height - marginBottom + 1})`)
   .attr("id", "x-axis")
   .call(xAxis)

svg.append("text")
   .attr("x", width/2 + 40)
   .attr("y", height + marginBottom + 10)
   .attr("text-anchor", "middle")
   .text("Years")

//y-axis
svg.append("g")
   .attr("transform", `translate(${marginLeft + barWidth -1}, ${-barHeight/2})`)
   .attr("id", "y-axis")
   .call(yAxis)

svg.append("text")
   .attr("transform", "rotate(270)")
   .attr("x", -height/2)
   .attr("y", 10)
   .attr("text-anchor", "middle")
   .text("Months") 
   
//temperature-axis
svg.append("g")
   .attr("transform", `translate(0, ${height + 60})`)
   .attr("id", "legend")
   .call(temperatureAxis)

const legendRectWidth = legendWidth/12;

//legend rects
svg.select("#legend")
   .selectAll("rect")
   .data(tickValues)
   .enter()
   .append("rect")
   .attr("x", (d,i) => legendScale(d))
   .attr("y", -legendRectWidth*3/4)
   .attr("width", legendRectWidth)
   .attr("height", legendRectWidth*3/4)
   .style("fill", (d, i) => colors[i])

//cells
svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", d => xScale(parseYear(d.year)))
   .attr("y", d => yScale(parseMonth(d.month)) - barHeight)
   .attr("width", barWidth)
   .attr("height", barHeight)
   .style("fill", d => legendColor((d.variance + baseTemperature)))
   .classed("cell", true)
   .attr("data-month", d => d.month - 1)
   .attr("data-year", d => d.year)
   .attr("data-temp", d => baseTemperature + d.variance)

//tooltip
const tooltip = d3.select("#graph")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("opacity", 0)

svg.selectAll(".cell")
   .on("mouseover", (event, datum) => {
      tooltip
         .html(() => {
            return `<div>${datum.year} - ${formatTime(parseMonth(datum.month))}</div>
                    <div>${(datum.variance + baseTemperature).toFixed(2)} °C</div>
                    <div>${datum.variance > 0 ? "+" : ""}${datum.variance.toFixed(2)} °C</div>`
         })
         .attr("data-year", datum.year)
         .style("top", `${event.pageY - 40}px`)
         .style("left", `${event.pageX + 40}px`)
         .style("opacity", 0.9)
   })
   .on("mouseout", (event, datum) => {
      tooltip
         .style("opacity", 0)
         .html("")
   })

graph.append(svg.node());