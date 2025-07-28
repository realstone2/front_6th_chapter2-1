export class Component {
  constructor(props = {}) {
    this.props = props;
    this.element = null;
  }

  render() {
    throw new Error("render() method must be implemented");
  }

  mount(container) {
    this.element = this.render();
    container.appendChild(this.element);
    return this.element;
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  update() {
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;
      const newElement = this.render();
      parent.replaceChild(newElement, this.element);
      this.element = newElement;
    }
  }
}
