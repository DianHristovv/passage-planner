const departureInput=document.getElementById("departure-time")
const speedInput=document.getElementById("speed")
const form=document.getElementById("coordinates-form")
const nameInput=document.getElementById("name")
const latitudeDegreesInput=document.getElementById("latitude-degrees")
const latitudeMinutesInput=document.getElementById("latitude-minutes")
const latitudeDirectionsChoice=document.getElementById("latitude-directions")
const longitudeDegreesInput=document.getElementById("longitude-degrees")
const longitudeMinutesInput=document.getElementById("longitude-minutes")
const longitudeDirectionsInput=document.getElementById("longitude-directions")
const destinationsList=document.getElementById("destinations-list")
const startButton=document.getElementById("start-button")
const routeOutput=document.getElementById("route-body")
const waypoints=JSON.parse(localStorage.getItem("waypoints"))||[]
let speed=JSON.parse(localStorage.getItem("speed"))
if(speed!==null){
    speedInput.value=speed
}
let departureTime=JSON.parse(localStorage.getItem("departureTime"))
if(departureTime!==null){
    departureInput.value=departureTime
}
let editingIndex=null

departureInput.addEventListener("input",function(){
     departureTime=departureInput.value
    localStorage.setItem("departureTime",JSON.stringify(departureTime))
    showRoutes()

})


speedInput.addEventListener("input",function(){
    speed=Number(speedInput.value)
    localStorage.setItem("speed",JSON.stringify(speed))
    showRoutes()
})

function splitPosition(decimal,type){
    let letter
    if(type==="lat"){
        letter=decimal<0?"S":"N"
    }
    else{
    letter=decimal<0?"W":"E"
}
const positive = Math.abs(decimal)
const degrees  = Math.floor(positive)
const minutes  = (positive - degrees) * 60
   return {
        degrees: degrees,
        minutes: minutes,
        direction: letter
    }
}

function addCell( row,text){
    const cell=document.createElement("td")
    cell.textContent=text
    row.appendChild(cell)
}





function legDistance(a,b){
   const latitudeDiff=(b.lat-a.lat)*60
   const longitudeDiff=(b.lon-a.lon)*60
   const midLatitude=(a.lat+b.lat)/2
   const departure=longitudeDiff*Math.cos(midLatitude*Math.PI/180)
   const distance=Math.sqrt((latitudeDiff*latitudeDiff)+(departure*departure))
   return distance
}

function formatPosition(decimal,type){
let letter
if(type==="lat"){
letter=decimal<0?"S":"N"
}
else{
    letter=decimal<0?"W":"E"
}
const positive=Math.abs(decimal)
const degrees=Math.floor(positive)
const minutes=(positive-degrees)*60

return degrees + "° " + minutes.toFixed(1) + "' " + letter




}
function toDecimal(degrees,minutes,directions){
    degrees=Number(degrees)
    minutes=Number(minutes)
    const convertToDegrees=minutes/60
    const decimal=degrees+convertToDegrees
    if(directions==="S"||directions==="W"){
       return decimal*-1
    }
    else{
    return decimal
}
}

function showRoutes(){ 
    routeOutput.innerHTML=""
    let total=0
    let legText
    for(let i=0;i<waypoints.length;i++){
        const waypoint=waypoints[i]

        if(i===0){
            legText="-"
        }
        else{
            const leg=legDistance(waypoints[i-1],waypoints[i])
            total+=leg
            legText=leg.toFixed(1)
        }
        let etaText=""
        if(speed&&departureTime){
            const hours=total/speed
            const eta=new Date(new Date(departureTime).getTime() + hours * 60 * 60 * 1000)
            const hh=String(eta.getHours()).padStart(2, "0")
            const mm=String(eta.getMinutes()).padStart(2, "0")
            const day=String(eta.getDate()).padStart(2, "0")
            const month=String(eta.getMonth()+1).padStart(2, "0")
            etaText = day + "." + month + " " + hh + ":" + mm
           
        }
        const row=document.createElement("tr")
        addCell(row,i+1)
        addCell(row,waypoint.name)
        addCell(row, formatPosition(waypoint.lat, "lat") + " " + formatPosition(waypoint.lon, "lon"))
        addCell(row,legText)
        addCell(row,total.toFixed(1))
        addCell(row,etaText)
        const actionsCell=document.createElement("td")
        const deleteButton=document.createElement("button")
        const upArrow=document.createElement("button")
        const downArrow=document.createElement("button")
        const editButton=document.createElement("button")
        upArrow.textContent="↑"
        upArrow.disabled=(i===0)
        downArrow.textContent="↓"
        editButton.textContent="Edit"
        downArrow.disabled=(i===waypoints.length-1)
        actionsCell.appendChild(upArrow)
        actionsCell.appendChild(downArrow)
        actionsCell.appendChild(editButton)
        deleteButton.textContent="Delete"
        actionsCell.appendChild(deleteButton)
        row.appendChild(actionsCell)
        
        routeOutput.appendChild(row)
        deleteButton.addEventListener("click",function(){
            waypoints.splice(i,1)
            localStorage.setItem("waypoints",JSON.stringify(waypoints))
            showRoutes()
        })
        upArrow.addEventListener("click",function(){
            const temp=waypoints[i]
            waypoints[i]=waypoints[i-1]
            waypoints[i-1]=temp
            localStorage.setItem("waypoints",JSON.stringify(waypoints))
            showRoutes()
        })

        downArrow.addEventListener("click",function(){
            const temp=waypoints[i]
            waypoints[i]=waypoints[i+1]
            waypoints[i+1]=temp
            localStorage.setItem("waypoints",JSON.stringify(waypoints))
            showRoutes()
        })

        editButton.addEventListener("click",function(){
            const lat=splitPosition(waypoint.lat,"lat")
            const lon=splitPosition(waypoint.lon,"lon")
            editingIndex=i
                nameInput.value=waypoint.name
                latitudeDegreesInput.value=lat.degrees
                latitudeMinutesInput.value=Number(lat.minutes.toFixed(1))
                latitudeDirectionsChoice.value=lat.direction
                longitudeDegreesInput.value=lon.degrees
                longitudeMinutesInput.value=Number(lon.minutes.toFixed(2))
                longitudeDirectionsInput.value=lon.direction
            
        })
    }
}
form.addEventListener("submit" ,function(event){
    event.preventDefault()
    if(nameInput.value.trim()===""||longitudeDegreesInput.value.trim()===""||longitudeMinutesInput.value.trim()===""||latitudeDegreesInput.value.trim()===""||latitudeMinutesInput.value.trim()===""){
        return
    }
    const waypoint={
        name: nameInput.value,
        lat: toDecimal(latitudeDegreesInput.value,latitudeMinutesInput.value,latitudeDirectionsChoice.value),
        lon: toDecimal(longitudeDegreesInput.value,longitudeMinutesInput.value,longitudeDirectionsInput.value)

    }
    if (editingIndex===null){
    waypoints.push(waypoint)}
    else{
        waypoints[editingIndex]=waypoint
        editingIndex=null
    }
    localStorage.setItem("waypoints",JSON.stringify(waypoints))
  console.log(waypoints)
  showRoutes()

})
showRoutes()

