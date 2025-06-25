import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const AIRTABLE_PAT = process.env.NEXT_PUBLIC_AIRTABLE_PAT;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_NAME = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_NAME;

const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get(airtableUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
      },
    });

    const customers = response.data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name,
      email: record.fields.Email,
    }));

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}