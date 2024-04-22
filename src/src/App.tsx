// INFO:
// w wersji residential production nie można wpisać 1,0 -> po próbie wipisania 0, zero znika

// import { Foo } from "./Foo";
import { FooTwo } from "./FooTwo";

export function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {/* <Foo min={-1} max={10} decimalPlaces={2} decimalSeparator="," /> */}
      <h2>Current peak production capacity</h2>
      <FooTwo min={1} max={1000} decimalPlaces={1} decimalSeparator="," />


      <h2>Expected yearly production</h2>
      <FooTwo min={1} max={1000000} decimalPlaces={0} decimalSeparator="," />

      <h2>New peak production capacity</h2>
      <FooTwo min={1} max={1000} decimalPlaces={1} decimalSeparator="," />

    </div>
  )
}
