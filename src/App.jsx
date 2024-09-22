import React from "./core/React.js"
export default function App() {
	const update = React.update()
	const [count, setCount] = React.useState(10)
	const [bar, setBar] = React.useState("bar")
	function handleOnclick() {
		setCount((e) => e + 1)
		setBar((e) => e + "bar")
	}
	return <div>
		count:{count}
		<br />
		bar:{bar}
		<button onClick={handleOnclick}>add</button>
	</div>
}