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
            this.tokenwasExpired = true;
            this.renewToken();
            if (this.tokenwasExpired) {
              alert('Login abgelaufen! Bitte ausloggen und neu einloggen.');
              this.tokenwasExpired = false;
              sessionStorage.removeItem('auth-token');
              sessionStorage.removeItem('auth-refreshtoken');
            } else {
              this.create(annotation);
            }
          }
        }
        this.all();
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
      .then((response) => this.all())
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
      .then((response) => this.all())
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
    }).then(response => {
      response.json()
      console.log(response);
    }
    )
      .then(data => {
        console.log(data);
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('auth-refreshtoken');
        sessionStorage.setItem('auth-token', data.access_token);
        sessionStorage.setItem('auth-refreshtoken', data.refresh_token);
        this.tokenwasExpired = false;
      })
      .catch(() => 
      {
        this.all();
        console.log('Catch reingegangen');
      })
  }
}
