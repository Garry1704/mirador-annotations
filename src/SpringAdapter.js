/** */
export default class SpringAdapter {
  /** */
  constructor(canvasId, endpointUrl) {
    this.canvasId = canvasId;
    this.endpointUrl = endpointUrl;
  }

  /** */
  get annotationPageId() {
    return `${this.endpointUrl}/?annoId=${this.canvasId}`;
  }

  /** */
  async create(annotation) {
    return fetch(this.endpointUrl, {
      body: JSON.stringify({
        annotation: {
          canvas: this.canvasId,
          data: JSON.stringify(annotation),
          uuid: annotation.id,
        },
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  /** */
  async update(annotation) {
    return fetch(this.endpointUrl, {
      body: JSON.stringify({
        annotation: {
          canvas: this.canvasId,
          data: JSON.stringify(annotation),
          uuid: annotation.id,
        },
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  /** */
  async delete(annoId) {
    return fetch(this.endpointUrl, {
      body: JSON.stringify({
        annotation: {
          canvas: this.canvasId,
          uuid: annoId,
        },
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
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
}
