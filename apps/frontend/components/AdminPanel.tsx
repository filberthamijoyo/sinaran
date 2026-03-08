'use client';

import React from 'react';
import DimensionTable from './DimensionTable';
import './AdminPanel.css';
import { usePersistedState } from '../hooks/usePersistedState';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = usePersistedState('admin_panel_tab', 'lots');

  const tabs = [
    {
      id: 'lots',
      label: 'Lots',
      component: (
        <DimensionTable
          title="Lots"
          endpoint="lots"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'spks',
      label: 'SPKs',
      component: (
        <DimensionTable
          title="SPKs"
          endpoint="spks"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'yarn-types',
      label: 'Yarn Types',
      component: (
        <DimensionTable
          title="Yarn Types"
          endpoint="yarn-types"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code', required: true, placeholder: 'e.g. PL' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'blends',
      label: 'Blends',
      component: (
        <DimensionTable
          title="Blends"
          endpoint="blends"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code', required: true, placeholder: 'e.g. RC' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="name"
          nameField="name"
        />
      ),
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      component: (
        <DimensionTable
          title="Suppliers"
          endpoint="suppliers"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'mills-units',
      label: 'Mills Units',
      component: (
        <DimensionTable
          title="Mills Units"
          endpoint="mills-units"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code', required: true, placeholder: 'e.g. OE' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'process-steps',
      label: 'Process Steps',
      component: (
        <DimensionTable
          title="Process Steps"
          endpoint="process-steps"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'test-types',
      label: 'Test Types',
      component: (
        <DimensionTable
          title="Test Types"
          endpoint="test-types"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'sides',
      label: 'Sides',
      component: (
        <DimensionTable
          title="Sides"
          endpoint="sides"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="code"
          nameField="name"
        />
      ),
    },
    {
      id: 'rayon-brands',
      label: 'Rayon Brands',
      component: (
        <DimensionTable
          title="Rayon Brands"
          endpoint="rayon-brands"
          primaryKey="id"
          apiBase="production"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="name"
          nameField="name"
        />
      ),
    },
    {
      id: 'count-ne',
      label: 'Count(Ne)',
      component: (
        <DimensionTable
          title="Count(Ne)"
          endpoint="counts"
          primaryKey="id"
          apiBase="production"
          fields={[
            { name: 'value', label: 'Value', required: true, type: 'number', placeholder: 'e.g. 30.00' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          codeField="value"
          nameField="value"
        />
      ),
    },
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Quality Admin Panel</h1>
        <p>Manage dimension tables and lookup data for the Quality module</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default AdminPanel;
