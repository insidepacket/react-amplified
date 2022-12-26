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

const APIEndPoint = 'https://o78zg3fl3j.execute-api.ap-southeast-2.amazonaws.com/dev/coffee';
const initialState = { "userid": '', "coffee": '' };


function App({ signOut, user }) {
  const [formData, setFormData] = useState(initialState)
  function setInput(key, value) {
    setFormData({ ...formData, [key]: value })
  }
  const [data, setData] = useState(null);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(APIEndPoint);
      const json = await response.json();
      setData(json);
    }
    fetchData();
  }, []);
  
  async function postData() {
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
  return await API.post(apiName, path, myInit);
  }

  function handleSumit(event) {
    event.preventDefault();
  }

  return (
    <div style={styles.container}>
      <Heading level={1}>Welcome {user.username}</Heading>
      <Button onClick={signOut} style={styles.button}>Sign out</Button>
      <h2> Order Your Coffee </h2>
      <form onSubmit={handleSumit}>
          <input  
            onChange={event => setInput('userid', event.target.value)}
            style={styles.input}
            value={formData.userid}
            placeholder="userid"
          />
          <input handleInputChange
            onChange={event => setInput('coffee', event.target.value)}
            style={styles.input}
            value={formData.coffee}
            placeholder="coffee"
          />
        <Button onClick={postData()} style={styles.button}> Submit </Button>
      </form>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App);