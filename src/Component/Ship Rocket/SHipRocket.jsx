import React from 'react';
import { Container, Button } from 'react-bootstrap';

export default function ShipRocket() {
  return (
    <div
      style={{
        minHeight: '84vh',
        background: 'var(--white, #FFF3E3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      <Container className="text-center shadow p-5  rounded" style={{ maxWidth: '500px', backgroundColor: 'var(--pagination-bg, #fde6c9ff)' }}>
        <img
          src="https://sr-website.shiprocket.in/wp-content/uploads/2023/01/shiprocket_logo.svg"
          alt="Shiprocket Logo"
          style={{ width: '180px', marginBottom: '30px' }}
        />
        <p className="mb-4 fw-bold" style={{ color: 'var(--text-black, #55142A)', fontSize: '36px' }}>Connect to Shiprocket</p>
        <p className="mb-4 " style={{ color: 'var(--text-black, #55142A)' }}>Link your Shiprocket account to start managing shipments easily.</p>
        <a
          href="https://app.shiprocket.in/newlogin?_gl=1*ybzu6v*_gcl_au*MTA2NzA0NDk5MS4xNzUwNDA2MTY5*_ga*NDY3MTY4MDcuMTc1MDQwNjE2OQ..*_ga_PGWFJGRBN7*czE3NTA0MDYxNjkkbzEkZzAkdDE3NTA0MDYxNjkkajYwJGwwJGgw*_ga_923W0EDVX1*czE3NTA0MDYxNjkkbzEkZzAkdDE3NTA0MDYxNjkkajYwJGwwJGgw"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="dark"
            size="lg"
            className="px-4 py-2"
            style={{
              borderRadius: '8px',
              backgroundColor: 'var(--text-black, #55142A)',
              color: 'var(--white, #FFF3E3)',
              border: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = "#333"}
            onMouseOut={e => e.currentTarget.style.backgroundColor = "black"}
          >
            Continue to Shiprocket
          </Button>
        </a>
      </Container>
    </div>
  );
}
