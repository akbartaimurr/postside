"use client";

import { Component } from "react";

// Catches a failed 3D canvas (WebGL disabled/blocked, GPU crashed) and renders `fallback`
// instead of taking the whole page down.
export default class WebGLBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("3D phone unavailable, showing the flat fallback:", error.message);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
