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
  const [formData, setFormData] = useState(initialState)
  const username = user.username
  function setInput(key, value) { 
    setFormData({ ...formData, [key]: value, 'userid': username })
  }


  const [data, setData] = useState();
  const [error, setError] = useState(null);
  const [checkedLattee, setLatteChecked] = useState(false);
  const [checkedFlatWhite, setFlatwhiteChecked] = useState(false);
  const [checkedCuppuccino, setCuppuccinoChecked] = useState(false);
  const [checkedHotChocolate, setHotChocolateChecked] = useState(false);

  /*
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(APIEndPoint);
      const json = await response.json();
      setData(json);
    }
    fetchData();
  }, []);
  */
  useEffect(() => {
    async function getData(username) {
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
        //console.log("API response: " + response);
        setData(response);
        } catch (error) {
        setError(error);
        }
    }
    getData(username);
  }, [username]);
   


  async function postData(username) {
    const apiName = 'api960f605b';
    const path = '/coffee';
    const myInit = {
      body: formData, // replace this with attributes you need
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`
    }
    };
    console.log(formData);
    return await API.post(apiName, path, myInit);
  }

  function handleSumit(event) {
    event.preventDefault();
    postData(); 
  }
  
  const handleLatteeCheckboxChange = (event) => {
    setLatteChecked(event.target.checked);
    setInput('coffee', event.target.value);
  }

  const handleFlatWhiteCheckboxChange = (event) => {
    setFlatwhiteChecked(event.target.checked);
    setInput('coffee', event.target.value);
  }

  const handleCuppuccinoCheckboxChange = (event) => {
    setCuppuccinoChecked(event.target.checked);
    setInput('coffee', event.target.value);
  }

  const handleHotChocolateChecke = (event) => {
    setHotChocolateChecked(event.target.checked);
    setInput('coffee', event.target.value);
  }


  return (
    <div style={styles.container}>
      <Heading level={1}>Welcome {user.username}</Heading>
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
          <label>
            <input
              type="checkbox"
              checked={checkedLattee}
              value="Lattee"
              style={styles.checkbox}
              onChange={handleLatteeCheckboxChange}
            />
            Latte
          </label>
          <br></br>
          <label>
            <input
              type="checkbox"
              checked={checkedFlatWhite}
              value="Flat White"
              style={styles.checkbox}
              onChange={handleFlatWhiteCheckboxChange}
            />
            Flat White
          </label>
          <br></br>
          <label>
            <input
              type="checkbox"
              checked={checkedCuppuccino}
              value="Cuppuccino"
              style={styles.checkbox}
              onChange={handleCuppuccinoCheckboxChange}
            />
            Cuppuccino
          </label>
          <br></br>
          <label>
            <input
              type="checkbox"
              checked={checkedHotChocolate}
              value="HotChocolate"
              style={styles.checkbox}
              onChange={handleHotChocolateChecke}
            />
            HotChocolate
          </label>
          <br></br>
          <button type="submit">Submit</button>
      </form>
      <h3> Your Orders </h3>
      {data ? (
        <pre>{data} </pre>
      ) : (
        <p>Loading data...</p>
      )}
      <p>{error} </p>
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 16, padding: '12px 0px' },
  checkbox: {margin: '5px', width: '30px', height: '12px', border: '2px solid black', backgroundColor: 'green'}
}

export default withAuthenticator(App);