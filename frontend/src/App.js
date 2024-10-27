import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.css';

const ProgressBar = ({ percentage }) => (
	<div className="progress-bar">
		<div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
		{percentage} %
	</div>
);

const Skill = ({ name, percentage }) => (
	<div className="skill">
		<strong>{name}</strong>
		<ProgressBar percentage={percentage}/>
	</div>
);

const TimelineEntry = ({ children }) => {
	const childArray = React.Children.toArray(children);

	if (childArray.length !== 4) {
		throw new Error('TimelineEntry expects exactly 4 children.');
	}

	const [first, second, third, fourth] = childArray;

	return (
		<>
			<div className="left">
				<strong>{first}</strong>
				<div>{second}</div>
			</div>
			<div className="right">
				<strong>{third}</strong>
				<p>{fourth}</p>
			</div>
		</>
	);
};

const Timeline = ({ children }) => (
	<div className="timeline">
		{children}
	</div>
);

const CvSection = ({ title, children, className }) => (
	<section className={className}>
		<h2 className="section-header">{title}</h2>
		<div className="section-content">
			{children}
		</div>
	</section>
);

function App() {
	const [searchParams, setSearchParams] = useSearchParams();

	const [url, setUrl] = useState(searchParams.get('url'));
	const [refresh, setRefresh] = useState(searchParams.has('refresh'));

	const [data, setData] = useState(null);

	const inputRef = useRef(null);

	const handleSubmit = (e) => {
		e.preventDefault();
		const url = inputRef.current.value;
		if (url) {
			const updatedParams = new URLSearchParams(searchParams);
			updatedParams.set('url', url);
			setSearchParams(updatedParams);
		}
	};

	useEffect(() => {
		setUrl(searchParams.get('url'));
		setRefresh(searchParams.has('refresh'));
	}, [searchParams])

	useEffect(() => {
		const params = new URLSearchParams();

		if (url) {
			params.append('url', url);
		}

		if (refresh) {
			params.append('refresh', '');
		}

		const apiUrl = `/api/extract?${params.toString()}`;

		fetch(apiUrl)
			.then(response => response.json())
			.then(data => setData(data))
			.catch(error => {
				console.error('Error parsing data:', error);
			});
	}, [url, refresh]);

	if (!data) {
		return <div className="loading">Crunching numbers...</div>;
	}

	document.title = data.name;
	document.querySelector("link[rel~='icon']").href = data.photo;

	return (
		<main>
			<div className="photo">
				<img src={data.photo} alt="Profile" width="400"/>
			</div>
			<div className="main-info">
				<div>
					<div className="title">{data.title_before_name}</div>
					<h1>{data.name}</h1>
					<div className="position">{data.position}</div>
				</div>
				<ul className="contact-list">
					<li key="0" className="location">{data.location}</li>
					<li key="1" className="phone">{data.phone}</li>
					<li key="2" className="mail">{data.email}</li>
				</ul>
			</div>
			<div className="additional-info">
				<CvSection title="About Me">
					<p>{data.description}</p>
				</CvSection>
				<CvSection title="Skills">
					{data.skills?.map((skill, index) => (
						<Skill key={index} name={skill.name} percentage={skill.level} />
					))}
				</CvSection>
				<CvSection title="Interests">
					{data.interests?.join(' · ')}
				</CvSection>
				{(data.github || data.linkedin) && (<CvSection title="Connect">
					<div className="connect">
					{data.github && (
						<a className="github" href={`https://${data.github}`}>{data.github}</a>
					)}
					{data.linkedin && (
						<a className="linkedin" href={`https://${data.linkedin}`}>{data.linkedin}</a>
					)}
					</div>
				</CvSection>)}
				<CvSection title="Generate your own CV!" className="cv-gen">
				<form onSubmit={handleSubmit}>
					<input type="url" placeholder="URL with your info" value={url} ref={inputRef} required/>
					<button type="submit">Submit</button>
				</form>
				</CvSection>
			</div>
			<div className="timelines">
				<CvSection title="Work Experience">
					<Timeline>
						{data.experience?.map((job, index) => (
							<TimelineEntry key={index}>
								{job.company}
								{`${job.start_month}/${job.start_year} – ${job.end_year ? `${job.end_month}/${job.end_year}` : 'present'}`}
								{job.title}
								{job.description}
							</TimelineEntry>
						))}
					</Timeline>
				</CvSection>
				<CvSection title="Education">
					<Timeline>
						{data.education?.map((edu, index) => (
							<TimelineEntry key={index}>
								{edu.institution}
								{<>{edu.subinstitution}<br/>{edu.end_year}</>}
								{edu.title}
								{edu.description}
							</TimelineEntry>
						))}
					</Timeline>
				</CvSection>
			</div>
		</main>
	);
}

export default App;
