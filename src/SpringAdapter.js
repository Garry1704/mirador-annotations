/** */
export default class SpringAdapter {
  /** */
  constructor(canvasId, endpointUrl, tokenrefreshUrl) {
    this.canvasId = canvasId;
    this.endpointUrl = endpointUrl;
    this.tokenrefreshUrl = tokenrefreshUrl;
    this.token = sessionStorage.getItem('auth-token');
    this.refreshtoken = sessionStorage.getItem('auth-refreshtoken');
    this.tokenwasExpired = false;

  }

  /** */
  get annotationPageId() {
    return `${this.endpointUrl}/?annoId=${this.canvasId}`;
  }

  /** */
  async create(annotation) {
    let myHeaders = new Headers();
    if (this.token) {
      const bearer = 'Bearer ' + this.token;
      myHeaders.append('Authorization', bearer);
    }
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');

    return fetch(this.endpointUrl, {
      body: JSON.stringify({
        annotation: {
          canvas: this.canvasId,
          data: JSON.stringify(annotation),
          uuid: annotation.id,
        },
      }),
      headers: myHeaders,

      method: 'POST',
      withCredentials: true,

    })
      .then(response => {
        console.log(response.status); // Will show you the status
        if (!response.ok) {
          if (response.status === 401) {
            const succeededRefresh = this.error401();
            if (succeededRefresh) {
              return this.create(annotation);
            }
          }
        }
        return this.all();
      })
      .catch(() => this.all());
  }

  /** */
  async update(annotation) {
    let myHeaders = new Headers();
    if (this.token) {
      const bearer = 'Bearer ' + this.token;
      myHeaders.append('Authorization', bearer);
    }
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    return fetch(this.endpointUrl, {
      body: JSON.stringify({
        annotation: {
          canvas: this.canvasId,
          data: JSON.stringify(annotation),
          uuid: annotation.id,
        },
      }),
      headers: myHeaders,
      method: 'PATCH',
      withCredentials: true,
    })
      .then((response) => {
        console.log(response.status); // Will show you the status
        if (!response.ok) {
          if (response.status === 401) {
            const succeededRefresh = this.error401();
            if (succeededRefresh) {
              return this.create(annotation);
            }
          }
        }
        return this.all();
      })
      .catch(() => this.all());
  }

  /** */
  async delete(annoId) {
    let myHeaders = new Headers();
    if (this.token) {
      const bearer = 'Bearer ' + this.token;
      myHeaders.append('Authorization', bearer);
    }
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    return fetch(this.endpointUrl, {
      body: JSON.stringify({
        annotation: {
          canvas: this.canvasId,
          uuid: annoId,
        },
      }),
      headers: myHeaders,
      method: 'DELETE',
      withCredentials: true,
    })
      .then((response) => {
        console.log(response.status); // Will show you the status
        if (!response.ok) {
          if (response.status === 401) {
            const succeededRefresh = this.error401();
            console.log(succeededRefresh);
            if (succeededRefresh) {
              return this.create(annotation);
            }
          }
        }
        return this.all();
      })
      .catch(() => this.all());
  }

  /** */
  async get(annoId) {
    return (await fetch(`${this.endpointUrl}/?annoId=${annoId}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })).json();
  }

  /** */
  async all() {
    return (await fetch(this.annotationPageId)).json();
  }

  /** */
  error401() {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-refreshtoken');
    return this.renewToken();
  }


  /** */
  renewToken() {
    let myHeaders = new Headers();
    if (this.token) {
      const bearer = 'Bearer ' + this.refreshtoken;
      myHeaders.append('Authorization', bearer);
    }
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    fetch(this.tokenrefreshUrl, {
      headers: myHeaders,
      method: 'GET',
      withCredentials: true,
    }).then((response) => response.json())
      .then((data) => {
        const oldToken = this.token;
        const newToken = data.access_token;
        const newRefreshToken = data.refresh_token;
        sessionStorage.setItem('auth-token', newToken);
        sessionStorage.setItem('auth-refreshtoken', newRefreshToken);
        if (oldToken === (newToken)) {
          console.log(oldToken);
          console.log(this.token);
          alert('Login abgelaufen! Bitte ausloggen und neu einloggen.');
          return false;
        }
        return true;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
