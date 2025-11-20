import { NextResponse } from 'next/server';

export async function GET() {
  const association = {
    applinks: {
      apps: [],
      details: [
        {
          appID: 'S2L7KLRB6C.com.lumo.lumoMobile',
          paths: ['/reset-password*'],
        },
      ],
    },
  };

  return NextResponse.json(association, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

