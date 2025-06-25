'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import AirtableIframe from '@/components/ui/add-supplier';
import AddSupplier from '@/components/dashboard/project/evaluate/addsupplier';
interface Supplier {
    id: string;
    name: string;
    email: string;
}

interface Props {
    searchParams: {
        project_id: string;
    };
}

const Home: React.FC<Props> = ({ searchParams }) => {
    const project_id = searchParams.project_id;

    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [layout, setLayout] = useState<'original' | 'select'>('original');

    useEffect(() => {
        const fetchSuppliers = async () => {
            let allRecords: Supplier[] = [];
            let offset = '';

            try {
                do {
                    const response = await axios.get(
                        `https://api.airtable.com/v0/${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID}/Suppliers`,
                        {
                            headers: {
                                Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_PAT}`,
                            },
                            params: {
                                offset: offset,
                            },
                        }
                    );
                    allRecords = [...allRecords, ...response.data.records];
                    offset = response.data.offset || '';
                } while (offset);

                const data = allRecords.map((record: any) => ({
                    id: record.id,
                    name: record.fields['Company'],
                    email: record.fields['Email'],
                }));

                setSuppliers(data);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };

        fetchSuppliers();
    }, []);
    const toggleSelectSupplier = (supplier: Supplier) => {
        const isSelected = selectedSuppliers.some(
            (selected) => selected.name === supplier.name
        );

        if (isSelected) {
            const updatedSuppliers = selectedSuppliers.filter(
                (selected) => selected.name !== supplier.name
            );
            setSelectedSuppliers(updatedSuppliers);
        } else {
            setSelectedSuppliers([...selectedSuppliers, supplier]);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!project_id) router.back();

    return (
        <div className="p-4">
            <AirtableIframe />
            <br />
            <h2 className="text-xl font-bold mb-4">Suppliers</h2>
            {layout === 'original' ? (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
            ) : (
                <></>
            )}

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map((supplier) => (
                    <div
                        key={supplier.id}
                        className="bg-white shadow-md rounded-lg p-4 mb-4"
                    >
                        <div>
                            <strong className="text-base font-bold mb-2">
                                {supplier.name}
                            </strong>
                        </div>
                        <div>
                            <AddSupplier
                                supplier_name={supplier.name}
                                project_id={project_id}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
