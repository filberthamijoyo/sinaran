'use client';

import React from 'react';
import ProductionDimensionTable from './ProductionDimensionTable';
import './AdminPanel.css';
import './Production.css';
import { usePersistedState } from '../hooks/usePersistedState';

const ProductionAdminPanel = () => {
  const [activeTab, setActiveTab] = usePersistedState(
    'production_admin_panel_tab',
    'mills-units',
  );

  const tabs = [
    {
      id: 'mills-units',
      label: 'Mills Units',
      component: (
        <ProductionDimensionTable
          title="Mills Units"
          endpoint="mills-units"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code', required: true, placeholder: 'e.g. OE' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'yarn-types',
      label: 'Yarn Types',
      component: (
        <ProductionDimensionTable
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
        />
      ),
    },
    {
      id: 'blends',
      label: 'Blends',
      component: (
        <ProductionDimensionTable
          title="Blends"
          endpoint="blends"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code', required: true, placeholder: 'e.g. RC' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'counts',
      label: 'Counts (Count Ne)',
      component: (
        <ProductionDimensionTable
          title="Counts (Count Ne)"
          endpoint="counts"
          primaryKey="id"
          fields={[
            { name: 'value', label: 'Value', required: true, type: 'number' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'slub-codes',
      label: 'Slub Codes',
      component: (
        <ProductionDimensionTable
          title="Slub Codes"
          endpoint="slub-codes"
          primaryKey="id"
          fields={[
            { name: 'code', label: 'Code', required: true },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'lots',
      label: 'Lots',
      component: (
        <ProductionDimensionTable
          title="Lots"
          endpoint="lots"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'spks',
      label: 'SPKs',
      component: (
        <ProductionDimensionTable
          title="SPKs"
          endpoint="spks"
          primaryKey="id"
          apiBase="unified"
          fields={[
            { name: 'code', label: 'Code', required: true, type: 'number' },
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'colors',
      label: 'Colors (Warna Cone)',
      component: (
        <ProductionDimensionTable
          title="Colors (Warna Cone)"
          endpoint="colors"
          primaryKey="id"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
    {
      id: 'rayon-brands',
      label: 'Rayon Brands',
      component: (
        <ProductionDimensionTable
          title="Rayon Brands"
          endpoint="rayon-brands"
          primaryKey="id"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'letterCode', label: 'Letter Code' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Production Admin Panel</h2>
        <p>Manage dimension tables and lookup data for the Production module</p>
      </div>

      <div className="production-module-content">
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
    </div>
  );
};

export default ProductionAdminPanel;

