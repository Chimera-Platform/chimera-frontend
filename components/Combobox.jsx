import React, { useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

const Combobox = ({ options, selected, onSelect }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative">
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center justify-between w-full p-2 bg-dark text-light rounded-lg border border-primary"
			>
				<span>{selected}</span>
				<FiChevronDown />
			</button>
			{open && (
				<div className="absolute w-full mt-1 bg-dark text-light border border-primary rounded-lg z-10">
					{options.map(option => (
						<div
							key={option}
							onClick={() => {
								onSelect(option);
								setOpen(false);
							}}
							className="px-2 py-1 hover:bg-primary cursor-pointer flex items-center"
						>
							{option === selected && <FiCheck className="mr-2" />}
							<span>{option}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Combobox;
