function drawTaxChart() {

    // constant margins, width, and height
    var margin = {top: 60, right: 20, bottom: 50, left: 60},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;



    // functions to parsetime and formattime in the data
    var parseTime = d3.timeParse("%Y");
    var formatTime = d3.timeFormat("%Y");
    function formatTax(d) {
    return "$" + d3.format(".4f")(d);
    };
    var bisectDate = d3.bisector(function(d) {
    return d.year;
    }).left;

    // set up our scales
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // set up area functions
    var moArea = d3.area()
    .x(function(d) { return x(d.year); })
    .y0(height)
    .y1(function(d) { return y(d.mo_tax); });
    var pArea = d3.area()
    .x(function(d) { return x(d.year); })
    .y0(function(d) { return y(d.mo_tax); })
    .y1(function(d) { return y(d.p_tax); });

    // set up our line functions
    var moValueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.mo_tax); });
    var pValueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.p_tax); });

    // make our svg
    var svg = d3.select(".tax-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // add a title
    svg.append("text")
    .attr("class", "chart-title")
    .attr("x", 0)
    .attr("y",  0 - (margin.top / 2))
    .text("Property Tax Rate in Coppell ISD");


    // import the data and plot
    d3.csv("property_tax_rates.csv").then(function(data) {

        // format the data
        data.forEach(function(d) {
            d.year = parseTime(d.year);
            d.mo_tax = +d.mo_tax;
            d.p_tax = +d.p_tax;
        });

        // set domains
        x.domain(d3.extent(data, function(d) { return d.year; }));
        y.domain([0, d3.max(data, function(d) { return d.p_tax; })]);

        // add the lines
        var moLine = svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", moValueline);
        var moLineArea = svg.append("path")
            .data([data])
            .style("fill", "#46384180")
            .attr("d", moArea);

        var pLine = svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", pValueline);
        var pLineArea = svg.append("path")
            .data([data])
            .style("fill", "#46384150")
            .attr("d", pArea);


        // tooltip
        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .attr("display", "none");

        tooltip.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .style("stroke", "var(--secondary)")
            .style("stroke-width", "2px");

        tooltip.append("text")
            .attr("class", "tooltip-date")
            .attr("x", 5)
            .attr("y", height - 18);

        tooltip.append("text")
            .attr("class", "tooltip-tax")
            .style("font-weight", "normal")
            .attr("x", 5)
            .attr("y", height - 5);

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseover", function() { tooltip.attr("display", null); })
            .on("mouseout", function() { tooltip.attr("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.pointer(event, this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.year > d1.year - x0 ? d1 : d0;

            tooltip.attr("transform", `translate(${x(d.year)}, 0)`);
            tooltip.select(".tooltip-date").text(formatTime(d.year));
            tooltip.select(".tooltip-tax").text("Total:" + formatTax(d.p_tax));

            tooltip.select("line").attr("y1", y(d.p_tax));
    }


    // x axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.top - 10)
        .style("text-anchor", "middle")
        .text("Year");

    // y axis
    svg.append("g")
        .attr("class", "axis")
        .style("font-size", "14px")
        .call(d3.axisLeft(y).ticks(4));
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Tax Rate");

    // add some annotations
    // svg.append("text")
    //     .attr("class", "annotation")
    //     .attr("x", width - 100)
    //     .attr("y", 55)
    //     .text("Debt service");


    });

}