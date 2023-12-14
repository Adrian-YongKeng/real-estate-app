import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";


export default function Maps({listing}) {
  return (
    <MapContainer 
      center={[listing.latitude, listing.longitude]} 
      zoom={13} 
      scrollWheelZoom={false} 
      style={{height:"100%", width:"100%"}}
    >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[listing.latitude, listing.longitude]}>
      <Popup>
        {listing.address}
      </Popup>
    </Marker>
  </MapContainer>
  )
}

