'use client';

// interface FirewallRowProps {
//   description: string,
//   sourceIp: string,
// }

export default function FirewallRow() {


  const handleDropRule = () => {
    console.log("drop firewall rule");
  }

  return (
    <>
      <tr>
        <td>
          <input type="text" value=""/>
        </td>
        <td>
          <input type="text" value=""/>
        </td>
        <td>3</td>
        <td>
          <input type="text"/>
        </td>
        <td>
          <button onClick={handleDropRule}>Drop</button>
        </td>
      </tr>
    </>
  );
}