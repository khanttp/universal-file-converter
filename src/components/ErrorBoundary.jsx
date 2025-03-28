// src/components/ErrorBoundary.jsx

import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Conversion Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-800 text-red-300 rounded">
          Conversion failed - Please check file format and size
        </div>
      );
    }
    return this.props.children;
  }
}
