import React from "react"

const References = ({ items }) => (
  <div className="references">
    <h2>References</h2>
    <ol>
      {items.map((item) => (
        <li id={`ref-${item.number}`} key={item.number}>
          {item.text}
          {" "}
        </li>
      ))}
    </ol>
  </div>
)

export default References