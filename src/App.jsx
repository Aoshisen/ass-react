import React from "./core/React.js"
export default function App() {
	const [count, setCount] = React.useState(10)
	function handleOnclick() {
		setCount((e) => e + 1)
	}
	React.useEffect(() => {
		console.log("init")
	}, [])

	React.useEffect(() => {
		console.log("update",count)
	}, [count])
	return <div>
		count:{count}
		<button onClick={handleOnclick}>add</button>
	</div>
}