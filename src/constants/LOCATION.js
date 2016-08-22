
/**
 * LOCATION provides the web application with either localhost or production services url.
 */
export default function api(){
	let pattern = new RegExp("127.0.0.1|localhost")  
	return ( pattern.test(window.location.hostname) ) ? "http://127.0.0.1:8000" : "http://54.200.79.214"
} 