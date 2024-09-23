import React from "./core/React.js"
export default function App() {
	const [count, setCount] = React.useState(10)
	function handleOnclick() {
		setCount((e) => e + 1)
	}
	React.useEffect(() => {
		//开始的时候执行一次
		console.log("useEffect")
	}, [count])
	return <div>
		count:{count}
		<button onClick={handleOnclick}>add</button>
	</div>
}