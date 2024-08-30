import { Doughnut } from "react-chartjs-2";

export function Dona({ data }) {
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: 10,
  };

  return (
    <div className="dona">
      <Doughnut data={data} options={options} />
    </div>
  );
}
