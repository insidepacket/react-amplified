import React, { useEffect, useState } from 'react'
import { Amplify, API, Auth } from 'aws-amplify'
//import { useFetch } from "react-async"
//import awsExports from "./aws-exports";
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
//Amplify.configure(awsExports);
Amplify.configure({
    // OPTIONAL - if your API requires authentication 
    Auth: {
        identityPoolId: 'ap-southeast-2:5af647d1-7f01-4e8b-9afb-27436ae8db9f', // REQUIRED - Amazon Cognito Identity Pool ID
        region: 'ap-southeast-2', // REQUIRED - Amazon Cognito Region
        userPoolId: 'ap-southeast-2_VKTvpvlTb', // OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: '173psomis449b53u02k9gqg6jt', // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    },
    API: {
        endpoints: [
            {
                name: "api960f605b",
                endpoint: "https://o78zg3fl3j.execute-api.ap-southeast-2.amazonaws.com/dev",
                custom_header: async () => {
                  return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`}
                    }
            }
        ]
    }
});

//const APIEndPoint = 'https://o78zg3fl3j.execute-api.ap-southeast-2.amazonaws.com/dev/coffee';
const initialState = { "userid": '', "coffee": '' };


function App({ signOut, user }) {
  //initiate the formdata
  const [formData, setFormData] = useState(initialState)
  // define function to set value of formdata
  const username = user.username
  function setInput(key, value) { 
    setFormData({ ...formData, [key]: value, 'userid': username })
  }

   //for GetData response
  const [jsonObjects, setJsonObjects] = useState([]); // the data varibale is json object
  const [error, setError] = useState(null);

  //for handleSumit input
  const [selectedOption, setSelectedOption] = useState(null);

  //for handleSumit API response
  const [postDataResponse, setDataPostResponse] = useState(null);

  //for cancelData() function's input
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);


  //getData()
  useEffect(() => {
    async function getData() {
      const apiName = 'api960f605b';
      const path = '/coffee';
      const myInit = {
        headers: {
          Authorization: `Bearer ${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`
        },
        queryStringParameters: {
          userid: username
        }
      };
      try {
        const response = await API.get(apiName, path, myInit); //response is a json string
        //console.log("response: " + response);
        const data = JSON.parse(response)
        setJsonObjects(data);
        } catch (error) {
        setError(error);
        }
    }
    getData();
  }, [username]);

  //postData
  const handleSumit = async (event) => {
    event.preventDefault();
    
    try {
      const apiName = 'api960f605b';
      const path = '/coffee';
      const myInit = {
        body: formData, 
        headers: {
          Authorization: `Bearer ${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`
        }
      };
      //console.log(formData);
      const postDataResponse = await API.post(apiName, path, myInit); 
      //interestingly the API response is a JSON object
      //console.log("postDataResponse: "+ postDataResponse);
      setDataPostResponse(postDataResponse);
      openPopup(postDataResponse)
    } catch (error) {
      console.log(error);
    }
    window.location.reload();
  }
   
  const openPopup = (data) => {
    const popup = window.open();
    popup.document.write(JSON.stringify(data, null, 2));
  };
  
  //cancelorder
  async function cancelOrder(orderid) {
    const apiName = 'api960f605b';
    const path = '/coffee/items/' + orderid;
    const myInit = {
      body: {}, // replace this with attributes you need
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`
    }
    };
    return await API.del(apiName, path, myInit);
  }

  const handleCancelOrders = (event) =>{
    event.preventDefault();
    console.log("selectedOrderIds: " + selectedOrderIds)
    for (const orderid of selectedOrderIds) {
      cancelOrder(orderid);
    }
    window.location.reload();
  }

  
  const handleSelectedOption = (event) => {
    setSelectedOption(event.target.checked);
    setInput('coffee', event.target.value);
  }

  const handleCheckboxChange = orderid => {
    if (selectedOrderIds.includes(orderid)) {
      setSelectedOrderIds(selectedOrderIds.filter(i => i !== orderid));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderid]);
    }
  };

  return (
    <div style={styles.container}>
      <Heading level={2}>Welcome {user.username}</Heading>
      <Button onClick={signOut} style={styles.button}>Sign out</Button>
      <h2> Order Your Coffee </h2>
      <form onSubmit={handleSumit}>
          <input handleInputChange
            onChange={event => setInput('coffee', event.target.value)}
            style={styles.input}
            value={formData.coffee}
            placeholder="coffee"
          />
          <br></br>
          <label for="coffee_choice">Select Your Coffee: </label>
          <select
            value={selectedOption}
            onChange={handleSelectedOption}
            style={styles.select}
          >
            <option value="Cuppuccino">Cuppuccino</option>
            <option value="HotChocolate">Hot Chocolate</option>
            <option value="FlatWhite">Flat White</option>
            <option value="Lattee">Lattee</option>
          </select>
          <br></br>
          <button type="submit" style={styles.submitbutton}>Submit</button>
      </form>  
      <h3> Your Current Orders </h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableth}></th>
            <th style={styles.tableth}>Order ID</th>
            <th style={styles.tableth}>Coffee</th>
          </tr>
        </thead>
        <tbody>
          {jsonObjects.map(obj => (
            <tr key={obj.orderid}>
              <td>
              <input
                type="checkbox"
                value={obj.orderid}
                style={styles.checkbox}
                onChange={() => handleCheckboxChange(obj.orderid)}
              />
            </td>
              <td style={styles.tabletd}>{obj.orderid}</td>
              <td style={styles.tabletd}>{obj.coffee}</td>
            </tr>
          ))}
        </tbody>   
       </table>
       <br></br>
       <Button onClick={handleCancelOrders} style={styles.submitbutton}>Cancel Order</Button>
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  button: { backgroundColor: '#268db9', color: 'white', outline: 'none', fontSize: 15, padding: '12px 0px'},
  submitbutton: { backgroundColor: '#268db9', color: 'white', outline: 'none', fontSize: 15, padding: '2px 5px', width: 240, border: 'none', borderRadius: '2px'},
  checkbox: {margin: 5, width: 30, height: 12, border: '2px solid black', backgroundColor: 'green'},
  select: {margin: 5, width: 180, fontSize: 15, padding: 3, border: '2px solid #ccc', borderRadius: '2px', backgroundColor: '#ddd', appearance: 'auto'},
  table: {border: '1px solid black',  backgroundColor: '#268db9', fontFamily: 'Arial, sans-serif',fontSize: 15, borderCollapse: 'collapse', color: 'white'},
  tableth: { margin: 5, border: '1px solid white', borderCollapse: 'collapse', padding: 5, textAlign: 'left'},
  tabletd: { margin: 5, border: '1px solid white', borderCollapse: 'collapse', padding: 5, textAlign: 'left'}
}

export default withAuthenticator(App);