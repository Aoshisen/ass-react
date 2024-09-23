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
		console.log("update", count)
		return () => {
			//调用所有的useEffect 之前去清空副作用 ,如果依赖项为空数组,那么其返回的函数不会执行
			console.log("clean up 1")
		}
	}, [count])

	React.useEffect(() => {
		console.log("update", count)
		return () => {
			//调用所有的useEffect 之前去清空副作用 ,如果依赖项为空数组,那么其返回的函数不会执行
			console.log("clean up 2")
		}
	}, [count])
	return <div>
		count:{count}
		<button onClick={handleOnclick}>add</button>
	</div>
}