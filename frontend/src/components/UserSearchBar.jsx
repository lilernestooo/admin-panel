import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Search } = Input

export default function UserSearchBar({ onSearch, placeholder = 'Search by name, user ID, email, or company...' }) {
  return (
    <>
      <Search
        allowClear
        placeholder={placeholder}
        enterButton={<SearchOutlined />}
        onChange={(e) => onSearch(e.target.value)}
        onSearch={onSearch}
        style={{ maxWidth: 420 }}
        size="middle"
        className="user-search-bar"
      />
      <style>{`
        .user-search-bar .ant-input-search-button {
          background-color: #0a0a0a;
          border: 2px solid #0a0a0a;
          border-left: none;
          border-radius: 0 6px 6px 0;
        }
        .user-search-bar .ant-input-search-button:hover,
        .user-search-bar .ant-input-search-button:focus {
          opacity: 0.85;
          background-color: #0a0a0a;
          border: 2px solid #0a0a0a;
          border-left: none;
        }

        .user-search-bar .ant-input-affix-wrapper,
        .user-search-bar .ant-input-affix-wrapper:hover,
        .user-search-bar .ant-input-affix-wrapper:focus,
        .user-search-bar .ant-input-affix-wrapper-focused {
          border: 1px solid #8a8080;
          border-right: none;
          border-radius: 6px 0 0 6px;
          box-shadow: none;
        }

        .user-search-bar .ant-input-search-button:focus,
        .user-search-bar .ant-input-search-button:active {
          box-shadow: none;
          outline: none;
        }
      `}</style>
    </>
  )
}