import ROOMS from '../../data/rooms'
export default function Rooms(){ return (<div style={{padding:20}}>{ROOMS.map(r=>(<div key={r.id}><h3>{r.name}</h3><p>{r.short}</p><a href='#' className='button-apple'>Book</a></div>))}</div>) }
